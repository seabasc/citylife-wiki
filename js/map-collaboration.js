(() => {
  const LEGACY_KEY = 'santos-cartel-map-legacy-import';
  const CACHE_MARKER = 'santos-cartel-map-cloud-cache-v1';

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
  }

  function readableError(error) {
    const message = error?.message || String(error || 'Unknown error');
    if (message.includes('INVALID_INVITE_CODE')) return 'That invite code is not valid.';
    if (message.includes('INVALID_USERNAME')) return 'Choose a username between 2 and 32 characters using letters, numbers, dots, dashes, or underscores.';
    if (message.includes('WORKSPACE_ALREADY_EXISTS')) return 'The shared wiki already exists. Join it with the site key.';
    if (message.includes('Invalid login credentials')) return 'That username or password is incorrect.';
    if (message.includes('User already registered')) return 'That username already has an account. Sign in instead.';
    if (message.includes('duplicate key') && message.includes('username')) return 'That username is already in use.';
    if (message.includes('MAP_VERSION_CONFLICT')) return 'Someone saved a newer map first. Your unsaved copy was backed up on this device.';
    return message;
  }

  function memberEmail(username) {
    const normalized = String(username || '').trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9_.-]{1,31}$/.test(normalized)) throw new Error('INVALID_USERNAME');
    return `${normalized}@members.citylife.invalid`;
  }

  window.createMapCollaboration = function createMapCollaboration(options) {
    const config = window.CITYLIFE_SUPABASE || {};
    const enabled = /^https:\/\//.test(config.url || '') && String(config.anonKey || '').length > 20;
    let client = null;
    let session = null;
    let profile = null;
    let membership = null;
    let workspace = null;
    let inviteCode = '';
    let documentVersion = 0;
    let channel = null;
    let saveTimer = null;
    let saving = false;
    let dirty = false;
    let status = enabled ? 'Sign in' : 'Local map';
    let errorMessage = '';

    const button = document.createElement('button');
    button.className = 'collab-button';
    button.id = 'collabButton';
    button.type = 'button';
    button.innerHTML = '<span class="collab-dot"></span><span>Local map</span>';
    document.getElementById('mapButton').after(button);

    const dialog = document.createElement('dialog');
    dialog.className = 'collab-dialog';
    dialog.id = 'collabDialog';
    dialog.innerHTML = '<div class="collab-dialog-body"></div>';
    document.body.append(dialog);

    const gate = document.createElement('section');
    gate.className = 'collab-gate';
    gate.id = 'collabGate';
    gate.setAttribute('aria-label', 'Private wiki access');
    gate.innerHTML = '<div class="collab-gate-card"><p>Checking access...</p></div>';
    document.body.append(gate);

    const canEdit = () => Boolean(membership && ['owner', 'editor'].includes(membership.role));
    const hasLegacy = () => Boolean(localStorage.getItem(LEGACY_KEY));

    function setStatus(nextStatus, error = '') {
      status = nextStatus;
      errorMessage = error;
      button.querySelector('span:last-child').textContent = status;
      button.classList.toggle('connected', Boolean(membership));
      button.classList.toggle('error', Boolean(error));
      document.body.classList.toggle('collab-locked', enabled && !canEdit());
      gate.hidden = !enabled || Boolean(membership);
      document.body.classList.toggle('collab-authorized', !enabled || Boolean(membership));
      if (!gate.hidden) renderGate();
      if (dialog.open) renderDialog();
      options.onStateChange?.({ enabled, session, profile, membership, workspace, status, error });
    }

    function stashLegacyMap() {
      if (localStorage.getItem(CACHE_MARKER)) return;
      const drawings = JSON.parse(localStorage.getItem('santos-cartel-map-drawings') || '[]');
      const locations = JSON.parse(localStorage.getItem('santos-cartel-map-locations') || '[]');
      if ((drawings.length || locations.length) && !hasLegacy()) {
        localStorage.setItem(LEGACY_KEY, JSON.stringify({ drawings, locations, savedAt: new Date().toISOString() }));
      }
      localStorage.setItem('santos-cartel-map-drawings', '[]');
      localStorage.setItem('santos-cartel-map-locations', '[]');
      localStorage.setItem(CACHE_MARKER, '1');
    }

    function applyDocument(mapDocument) {
      documentVersion = Number(mapDocument?.version || 0);
      options.applySnapshot({
        drawings: Array.isArray(mapDocument?.drawings) ? mapDocument.drawings : [],
        locations: Array.isArray(mapDocument?.locations) ? mapDocument.locations : [],
        layers: mapDocument?.layers && typeof mapDocument.layers === 'object' ? mapDocument.layers : {}
      });
    }

    function clearPrivateCache() {
      options.applySnapshot({ drawings: [], locations: [], layers: {} });
    }

    async function subscribe() {
      if (channel) await client.removeChannel(channel);
      if (!workspace) return;
      channel = client.channel(`map-${workspace.id}`)
        .on('postgres_changes', { event:'UPDATE', schema:'public', table:'map_documents', filter:`workspace_id=eq.${workspace.id}` }, payload => {
          if (Number(payload.new.version) <= documentVersion) return;
          applyDocument(payload.new);
          setStatus('Map updated');
        })
        .subscribe();
    }

    async function loadAccount() {
      if (!session?.user) {
        profile = null;
        membership = null;
        workspace = null;
        inviteCode = '';
        clearPrivateCache();
        setStatus('Sign in');
        return;
      }

      const profileResult = await client.from('profiles').select('id, username').eq('id', session.user.id).maybeSingle();
      if (profileResult.error) throw profileResult.error;
      profile = profileResult.data;

      const memberResult = await client.from('workspace_members').select('workspace_id, role').eq('user_id', session.user.id).limit(1).maybeSingle();
      if (memberResult.error) throw memberResult.error;
      membership = memberResult.data;
      if (!membership) {
        workspace = null;
        clearPrivateCache();
        setStatus('Join shared map');
        return;
      }

      const [workspaceResult, mapResult] = await Promise.all([
        client.from('workspaces').select('id, name').eq('id', membership.workspace_id).single(),
        client.from('map_documents').select('workspace_id, drawings, locations, layers, version, updated_by, updated_at').eq('workspace_id', membership.workspace_id).single()
      ]);
      if (workspaceResult.error) throw workspaceResult.error;
      if (mapResult.error) throw mapResult.error;
      workspace = workspaceResult.data;
      applyDocument(mapResult.data);

      inviteCode = '';
      if (membership.role === 'owner') {
        const inviteResult = await client.from('workspace_invites').select('invite_code').eq('workspace_id', workspace.id).maybeSingle();
        if (inviteResult.error) throw inviteResult.error;
        inviteCode = inviteResult.data?.invite_code || '';
      }
      await subscribe();
      setStatus('Map synced');
    }

    async function handleSession(nextSession) {
      session = nextSession;
      try {
        await loadAccount();
      } catch (error) {
        setStatus('Sync unavailable', readableError(error));
      }
    }

    async function saveNow() {
      clearTimeout(saveTimer);
      if (!enabled || !canEdit() || !workspace) return false;
      if (saving) {
        dirty = true;
        return false;
      }
      saving = true;
      setStatus('Saving map...');
      const snapshot = options.getSnapshot();
      try {
        const result = await client.rpc('save_map_document', {
          target_workspace: workspace.id,
          expected_version: documentVersion,
          new_drawings: snapshot.drawings,
          new_locations: snapshot.locations,
          new_layers: snapshot.layers
        });
        if (result.error) throw result.error;
        documentVersion = Number(result.data);
        setStatus('Map synced');
        return true;
      } catch (error) {
        localStorage.setItem('santos-cartel-map-conflict-backup', JSON.stringify({ ...snapshot, savedAt:new Date().toISOString() }));
        setStatus('Save needs attention', readableError(error));
        if (String(error?.message || '').includes('MAP_VERSION_CONFLICT')) await loadAccount();
        return false;
      } finally {
        saving = false;
        if (dirty) {
          dirty = false;
          saveSoon();
        }
      }
    }

    function saveSoon() {
      if (!canEdit()) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveNow, 650);
      setStatus('Saving soon...');
    }

    async function importLegacy() {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
      if (!legacy || membership?.role !== 'owner') return;
      const current = options.getSnapshot();
      const importedAt = new Date().toISOString();
      const claimItems = items => items.map(item => ({ ...item, createdBy:item.createdBy || profile?.username, createdAt:item.createdAt || importedAt, updatedBy:profile?.username, updatedAt:importedAt }));
      const mergeById = (cloudItems, localItems) => [...new Map([...cloudItems, ...localItems].map(item => [item.id, item])).values()];
      options.applySnapshot({
        drawings: mergeById(current.drawings, claimItems(legacy.drawings || [])),
        locations: mergeById(current.locations, claimItems(legacy.locations || [])),
        layers: current.layers
      });
      if (await saveNow()) localStorage.removeItem(LEGACY_KEY);
    }

    function renderGate() {
      const card = gate.querySelector('.collab-gate-card');
      if (!session) {
        card.innerHTML = `<div class="collab-gate-brand"><span>CL</span><div><small>Private community wiki</small><h1>City Life / Santos Cartel</h1></div></div><p class="collab-gate-intro">Sign in to access the wiki and shared map.</p><form id="collabPasswordSignIn"><label>Username<input name="username" autocomplete="username" minlength="2" maxlength="32" required></label><label>Password<input name="password" type="password" autocomplete="current-password" minlength="8" required></label><button type="submit">Sign in</button></form><div class="collab-divider"><span>New member</span></div><form id="collabSignUp"><label>Username<input name="username" autocomplete="username" minlength="2" maxlength="32" required></label><label>Password<input name="password" type="password" autocomplete="new-password" minlength="8" required></label><label>Site key<input name="code" autocomplete="off" required></label><button type="submit">Create account</button></form><details class="collab-owner-setup"><summary>First-time owner setup</summary><form id="collabOwnerSignUp"><label>Owner username<input name="username" autocomplete="username" minlength="2" maxlength="32" required></label><label>Owner password<input name="password" type="password" autocomplete="new-password" minlength="8" required></label><button type="submit">Create owner account</button></form></details>${errorMessage ? `<p class="collab-error">${escapeHtml(errorMessage)}</p>` : ''}`;
        return;
      }
      const suggestedName = profile?.username || session.user.user_metadata?.username || '';
      card.innerHTML = `<div class="collab-gate-brand"><span>CL</span><div><small>Account created</small><h1>Join the private wiki</h1></div></div><p class="collab-gate-intro">Enter the site key supplied by the owner.</p><form id="collabJoin"><label>Username<input name="username" minlength="2" maxlength="32" value="${escapeHtml(suggestedName)}" required></label><label>Site key<input name="code" autocomplete="off" required></label><button type="submit">Join wiki</button></form><details class="collab-owner-setup"><summary>First-time owner setup</summary><form id="collabCreate"><label>Username<input name="username" minlength="2" maxlength="32" value="${escapeHtml(suggestedName)}" required></label><label>Workspace name<input name="workspace" value="Santos Cartel" minlength="2" maxlength="80" required></label><button type="submit">Create first workspace</button></form></details><button class="collab-text-button" id="collabSignOut" type="button">Sign out</button>${errorMessage ? `<p class="collab-error">${escapeHtml(errorMessage)}</p>` : ''}`;
    }

    async function submitAccessForm(event) {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.target));
      try {
        if (event.target.id === 'collabPasswordSignIn') {
          const result = await client.auth.signInWithPassword({ email:memberEmail(values.username), password:values.password });
          if (result.error) throw result.error;
          await handleSession(result.data.session);
        } else if (event.target.id === 'collabSignUp') {
          const result = await client.auth.signUp({ email:memberEmail(values.username), password:values.password, options:{ data:{ username:values.username.trim() } } });
          if (result.error) throw result.error;
          if (!result.data.session) throw new Error('Password signup requires Confirm email to be disabled in Supabase Auth settings.');
          session = result.data.session;
          const joinResult = await client.rpc('join_map_workspace', { join_code:values.code, display_name:values.username });
          if (joinResult.error) throw joinResult.error;
          await loadAccount();
        } else if (event.target.id === 'collabOwnerSignUp') {
          const result = await client.auth.signUp({ email:memberEmail(values.username), password:values.password, options:{ data:{ username:values.username.trim() } } });
          if (result.error) throw result.error;
          if (!result.data.session) throw new Error('Password signup requires Confirm email to be disabled in Supabase Auth settings.');
          await handleSession(result.data.session);
        } else if (event.target.id === 'collabJoin') {
          const result = await client.rpc('join_map_workspace', { join_code:values.code, display_name:values.username });
          if (result.error) throw result.error;
          await loadAccount();
        } else if (event.target.id === 'collabCreate') {
          const result = await client.rpc('create_map_workspace', { workspace_name:values.workspace, display_name:values.username });
          if (result.error) throw result.error;
          await loadAccount();
        }
      } catch (error) {
        setStatus('Action failed', readableError(error));
      }
    }

    function renderDialog() {
      const body = dialog.querySelector('.collab-dialog-body');
      if (!enabled) {
        body.innerHTML = `<div class="collab-head"><div><small>Shared map</small><h2>Connect Supabase</h2></div><button class="collab-close" type="button" aria-label="Close">&times;</button></div><p>Add the public Project URL and publishable key to <code>supabase-config.js</code>, then follow <code>docs/supabase-map-setup.md</code>.</p>`;
      } else if (!session) {
        body.innerHTML = `<div class="collab-head"><div><small>Private community wiki</small><h2>Session ended</h2></div><button class="collab-close" type="button" aria-label="Close">&times;</button></div><p>Sign in again from the private access screen.</p>`;
      } else if (!membership) {
        const suggestedName = profile?.username || session.user.user_metadata?.username || '';
        body.innerHTML = `<div class="collab-head"><div><small>Signed in</small><h2>Join the private wiki</h2></div><button class="collab-close" type="button" aria-label="Close">&times;</button></div><form id="collabJoin"><label>Username<input name="username" minlength="2" maxlength="32" value="${escapeHtml(suggestedName)}" required></label><label>Site key<input name="code" autocomplete="off" required></label><button type="submit">Join wiki</button></form><button class="collab-text-button" id="collabSignOut" type="button">Sign out</button>${errorMessage ? `<p class="collab-error">${escapeHtml(errorMessage)}</p>` : ''}`;
      } else {
        body.innerHTML = `<div class="collab-head"><div><small>${escapeHtml(membership.role)}</small><h2>${escapeHtml(workspace?.name || 'Shared map')}</h2></div><button class="collab-close" type="button" aria-label="Close">&times;</button></div><div class="collab-member"><strong>${escapeHtml(profile?.username || session.user.email)}</strong><span>${escapeHtml(status)}</span></div>${inviteCode ? `<label>Member invite code<div class="collab-code"><code>${escapeHtml(inviteCode)}</code><button id="copyInviteCode" type="button">Copy</button></div></label>` : ''}${hasLegacy() && membership.role === 'owner' ? '<button id="importLegacyMap" type="button">Import this device\'s old map</button>' : ''}<button id="syncMapNow" type="button">Sync now</button><button class="collab-text-button" id="collabSignOut" type="button">Sign out</button>${errorMessage ? `<p class="collab-error">${escapeHtml(errorMessage)}</p>` : ''}`;
      }
    }

    button.addEventListener('click', () => {
      renderDialog();
      dialog.showModal();
    });
    gate.addEventListener('submit', submitAccessForm);
    gate.addEventListener('click', async event => {
      if (event.target.id === 'collabSignOut') await client.auth.signOut();
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog || event.target.closest('.collab-close')) dialog.close();
    });
    dialog.addEventListener('submit', submitAccessForm);
    dialog.addEventListener('click', async event => {
      if (event.target.id === 'collabSignOut') await client.auth.signOut();
      if (event.target.id === 'syncMapNow') await saveNow();
      if (event.target.id === 'importLegacyMap') await importLegacy();
      if (event.target.id === 'copyInviteCode') {
        await navigator.clipboard.writeText(inviteCode);
        event.target.textContent = 'Copied';
      }
    });

    async function init() {
      setStatus(status);
      if (!enabled) return;
      if (!window.supabase?.createClient) {
        setStatus('Sync unavailable', 'The Supabase browser library did not load.');
        return;
      }
      stashLegacyMap();
      clearPrivateCache();
      client = window.supabase.createClient(config.url, config.anonKey, { auth:{ persistSession:true, detectSessionInUrl:true } });
      client.auth.onAuthStateChange((_event, nextSession) => setTimeout(() => handleSession(nextSession), 0));
      const result = await client.auth.getSession();
      if (result.error) setStatus('Sign-in error', readableError(result.error));
      else await handleSession(result.data.session);
    }

    return {
      init,
      saveSoon,
      saveNow,
      enabled: () => enabled,
      canEdit,
      author: () => profile?.username || ''
    };
  };
})();

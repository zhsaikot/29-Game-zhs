/**
 * 29 (Twenty-Nine) Card Game - Main Controller
 * 100% Perfect Edition: Cinematic Timing, Wide Fan, High Contrast & Full Visibility
 */

import { SUITS, RANKS, PLAYERS, TEAMS, GAME_PHASES, BID_RULES, SETTINGS_DEFAULTS, PRESET_AVATARS, DEFAULT_PLAYER_AVATARS } from './constants.js';
import { GameState } from './gameState.js';
import { AIEngine } from './aiEngine.js';
import { SoundEngine } from './audio.js';
import { CardRenderer } from './cardRenderer.js';

class TwentyNineApp {
  constructor() {
    this.sound = new SoundEngine();
    this.ai = new AIEngine();
    this.gameState = new GameState();

    this.currentLanguage = 'en';
    this.selectedBid = 16;
    this.aiTurnTimeout = null;
    this.currentEditingPlayerId = 0;

    // Persisted Player Avatars
    this.playerAvatars = {
      0: localStorage.getItem('twenty_nine_avatar_0') || DEFAULT_PLAYER_AVATARS[0],
      1: localStorage.getItem('twenty_nine_avatar_1') || DEFAULT_PLAYER_AVATARS[1],
      2: localStorage.getItem('twenty_nine_avatar_2') || DEFAULT_PLAYER_AVATARS[2],
      3: localStorage.getItem('twenty_nine_avatar_3') || DEFAULT_PLAYER_AVATARS[3],
    };

    this.cacheDOM();
    this.bindEvents();
    this.renderPlayerAvatars();
    this.updateLanguageUI();
    this.initGame();
  }

  cacheDOM() {
    // Header & HUD
    this.brandTitle = document.getElementById('brand-title');
    this.hudTrumpSlot = document.getElementById('hud-trump-slot');
    this.hudTrumpIcon = document.getElementById('hud-trump-icon');
    this.hudTrumpLabel = document.getElementById('hud-trump-label');
    this.hudTargetTitle = document.getElementById('hud-target-title');
    this.hudTargetVal = document.getElementById('hud-target-val');
    this.labelTeam1 = document.getElementById('label-team1');
    this.labelTeam2 = document.getElementById('label-team2');
    this.scoreTeam1Val = document.getElementById('score-team1-val');
    this.scoreTeam2Val = document.getElementById('score-team2-val');
    this.team1Pips = document.getElementById('team1-pips');
    this.team2Pips = document.getElementById('team2-pips');
    this.btnLangToggle = document.getElementById('btn-lang-toggle');
    this.langIndicator = document.getElementById('lang-indicator');

    // Arena Slots & Cards
    this.trickArena = document.getElementById('trick-arena');
    this.trickRoundLabel = document.getElementById('trick-round-label');
    this.trickCurrentPoints = document.getElementById('trick-current-points');
    this.slotNorth = document.getElementById('slot-north');
    this.slotWest = document.getElementById('slot-west');
    this.slotEast = document.getElementById('slot-east');
    this.slotSouth = document.getElementById('slot-south');

    // Hand & Controls
    this.playerHandContainer = document.getElementById('player-hand-container');
    this.btnRevealTrump = document.getElementById('btn-reveal-trump');
    this.textRevealTrump = document.getElementById('text-reveal-trump');
    this.btnClaimMarriage = document.getElementById('btn-claim-marriage');
    this.textClaimMarriage = document.getElementById('text-claim-marriage');

    // Floating Bidding Dock
    this.floatingBiddingPanel = document.getElementById('floating-bidding-panel');
    this.labelYourBid = document.getElementById('label-your-bid');
    this.dockHighestBidLabel = document.getElementById('dock-highest-bid-label');
    this.quickBidChips = document.getElementById('quick-bid-chips');
    this.btnDockPass = document.getElementById('btn-dock-pass');
    this.btnDockSubmit = document.getElementById('btn-dock-submit');

    // Pods, Names & Stubs
    this.pods = {
      0: document.getElementById('pod-south'),
      1: document.getElementById('pod-east'),
      2: document.getElementById('pod-north'),
      3: document.getElementById('pod-west')
    };
    this.playerNames = {
      0: document.getElementById('name-south'),
      1: document.getElementById('name-east'),
      2: document.getElementById('name-north'),
      3: document.getElementById('name-west')
    };
    this.statusTags = {
      0: document.getElementById('status-south'),
      1: document.getElementById('status-east'),
      2: document.getElementById('status-north'),
      3: document.getElementById('status-west')
    };
    this.counts = {
      1: document.getElementById('count-east'),
      2: document.getElementById('count-north'),
      3: document.getElementById('count-west')
    };
    this.crowns = {
      0: document.getElementById('crown-south'),
      1: document.getElementById('crown-east'),
      2: document.getElementById('crown-north'),
      3: document.getElementById('crown-west')
    };
    this.northStubs = document.getElementById('north-card-stubs');
    this.westStubs = document.getElementById('west-card-stubs');
    this.eastStubs = document.getElementById('east-card-stubs');

    // Modals
    this.modalTrumpSelect = document.getElementById('modal-trump-select');
    this.titleTrumpSelect = document.getElementById('title-trump-select');
    this.descTrumpSelect = document.getElementById('desc-trump-select');
    this.btnTrumpSeventh = document.getElementById('btn-trump-seventh');

    this.challengeBanner = document.getElementById('challenge-banner');
    this.challengeText = document.getElementById('challenge-text');
    this.btnAcceptDouble = document.getElementById('btn-accept-double');
    this.btnSkipDouble = document.getElementById('btn-skip-double');

    this.modalRoundEnd = document.getElementById('modal-round-end');
    this.roundResultTitle = document.getElementById('round-result-title');
    this.roundResultBody = document.getElementById('round-result-body');
    this.btnNextRound = document.getElementById('btn-next-round');

    this.modalMatchOver = document.getElementById('modal-match-over');
    this.matchOverTitle = document.getElementById('match-over-title');
    this.matchOverBody = document.getElementById('match-over-body');
    this.btnRestartMatch = document.getElementById('btn-restart-match');

    this.modalRules = document.getElementById('modal-rules');
    this.titleRulesModal = document.getElementById('title-rules-modal');
    this.rulesContent = document.getElementById('rules-content');
    this.modalSettings = document.getElementById('modal-settings');
    this.titleSettingsModal = document.getElementById('title-settings-modal');
    this.toastContainer = document.getElementById('toast-container');

    // Avatar Chooser Modal
    this.modalAvatarChooser = document.getElementById('modal-avatar-chooser');
    this.titleAvatarModal = document.getElementById('title-avatar-modal');
    this.avatarTargetName = document.getElementById('avatar-target-name');
    this.avatarPresetsGrid = document.getElementById('avatar-presets-grid');
    this.avatarFileInput = document.getElementById('avatar-file-input');
    this.btnTriggerUpload = document.getElementById('btn-trigger-upload');
    this.btnCloseAvatarModal = document.getElementById('btn-close-avatar-modal');
    this.textUploadAvatar = document.getElementById('text-upload-avatar');

    this.avatarIconEls = {
      0: document.getElementById('avatar-icon-0'),
      1: document.getElementById('avatar-icon-1'),
      2: document.getElementById('avatar-icon-2'),
      3: document.getElementById('avatar-icon-3')
    };

    // Buttons
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.soundIcon = document.getElementById('sound-icon');
    this.btnRulesDialog = document.getElementById('btn-rules-dialog');
    this.btnCloseRules = document.getElementById('btn-close-rules');
    this.btnSettingsDialog = document.getElementById('btn-settings-dialog');
    this.btnSaveSettings = document.getElementById('btn-save-settings');
  }

  bindEvents() {
    this.gameState.on('phaseChange', () => this.renderHandsAndCounts());
    this.gameState.on('biddingStarted', (data) => this.handleBiddingTurn(data.currentBidder));
    this.gameState.on('biddingTurn', (data) => this.handleBiddingTurn(data.currentBidder));
    this.gameState.on('bidPlaced', (data) => this.onBidPlaced(data));
    this.gameState.on('biddingConcluded', (data) => this.onBiddingConcluded(data));
    this.gameState.on('trumpSelected', (data) => this.onTrumpSelected(data));
    this.gameState.on('challengePhaseStarted', (data) => this.handleChallengePhase(data));
    this.gameState.on('challengeAnnounced', (data) => this.onChallengeAnnounced(data));
    this.gameState.on('trickStarted', (data) => this.onTrickStarted(data));
    this.gameState.on('cardPlayed', (data) => this.onCardPlayed(data));
    this.gameState.on('turnChanged', (data) => this.onTurnChanged(data.currentTurn));
    this.gameState.on('trumpRevealed', (data) => this.onTrumpRevealed(data));
    this.gameState.on('marriageAnnounced', (data) => this.onMarriageAnnounced(data));
    this.gameState.on('trickResolved', (data) => this.onTrickResolved(data));
    this.gameState.on('roundEnded', (data) => this.onRoundEnded(data));

    // Language Toggle
    this.btnLangToggle.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.currentLanguage = this.currentLanguage === 'bn' ? 'en' : 'bn';
      this.updateLanguageUI();
      this.showToast(this.currentLanguage === 'bn' ? 'বাংলা ভাষা সক্রিয় করা হয়েছে' : 'Switched to English');
    });

    // Quick Bid Chips
    this.quickBidChips.querySelectorAll('.chip-bid').forEach(chip => {
      chip.addEventListener('click', () => {
        this.sound.playButtonClick();
        this.quickBidChips.querySelectorAll('.chip-bid').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        this.selectedBid = parseInt(chip.dataset.val, 10);
      });
    });

    this.btnDockPass.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.floatingBiddingPanel.classList.remove('active');
      this.gameState.submitBid(0, 0);
    });

    this.btnDockSubmit.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.floatingBiddingPanel.classList.remove('active');
      this.gameState.submitBid(0, this.selectedBid);
    });

    // Trump Selection
    document.querySelectorAll('.trump-pick-card[data-suit]').forEach(cardEl => {
      cardEl.addEventListener('click', () => {
        const suit = cardEl.dataset.suit;
        this.sound.playButtonClick();
        this.modalTrumpSelect.classList.remove('active');
        this.gameState.selectTrump(suit, false);
      });
    });

    this.btnTrumpSeventh.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.modalTrumpSelect.classList.remove('active');
      this.gameState.selectTrump(null, true);
    });

    // Action Buttons
    this.btnRevealTrump.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.gameState.revealTrump(0);
    });

    this.btnClaimMarriage.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.gameState.checkMarriage();
      this.btnClaimMarriage.style.display = 'none';
    });

    // Challenge Buttons
    this.btnAcceptDouble.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.challengeBanner.style.display = 'none';
      this.gameState.applyChallenge(1, 'double');
      this.gameState.startPlayingTricks();
    });

    this.btnSkipDouble.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.challengeBanner.style.display = 'none';
      this.gameState.startPlayingTricks();
    });

    // Next Round & Restart
    this.btnNextRound.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.modalRoundEnd.classList.remove('active');
      this.resetTableForNewRound();
      this.gameState.startNewRound();
    });

    this.btnRestartMatch.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.modalMatchOver.classList.remove('active');
      this.gameState.matchScores = { team1: 0, team2: 0 };
      this.updateScoreLedger();
      this.resetTableForNewRound();
      this.gameState.startNewRound();
    });

    // Audio & Settings
    this.btnSoundToggle.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
      const isBn = this.currentLanguage === 'bn';
      this.showToast(isBn ? (isMuted ? 'সাউন্ড বন্ধ' : 'সাউন্ড চালু') : (isMuted ? 'Sound Muted' : 'Sound Enabled'));
    });

    this.btnRulesDialog.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.modalRules.classList.add('active');
    });

    this.btnCloseRules.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.modalRules.classList.remove('active');
    });

    this.btnSettingsDialog.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.modalSettings.classList.add('active');
    });

    this.btnSaveSettings.addEventListener('click', () => {
      this.sound.playButtonClick();
      const dir = document.getElementById('setting-turn-dir').value;
      const lastTrick = document.getElementById('setting-last-trick').checked;
      const highBid = document.getElementById('setting-high-bid').checked;
      this.gameState.settings.turnDirection = dir;
      this.gameState.settings.lastTrickPoint = lastTrick;
      this.gameState.settings.highBidDoublePoints = highBid;
      this.modalSettings.classList.remove('active');
      this.showToast(this.currentLanguage === 'bn' ? 'সেটিংস সংরক্ষিত হয়েছে' : 'Settings saved');
    });

    // Avatar Chooser Triggers & Upload
    document.querySelectorAll('.player-avatar-wrap[data-player-id]').forEach(wrap => {
      wrap.addEventListener('click', () => {
        this.sound.playButtonClick();
        const pid = parseInt(wrap.dataset.playerId, 10);
        this.openAvatarChooser(pid);
      });
    });

    this.btnCloseAvatarModal.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.modalAvatarChooser.classList.remove('active');
    });

    this.btnTriggerUpload.addEventListener('click', () => {
      this.sound.playButtonClick();
      this.avatarFileInput.click();
    });

    this.avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        this.setPlayerAvatar(this.currentEditingPlayerId, dataUrl);
        this.modalAvatarChooser.classList.remove('active');
        this.avatarFileInput.value = '';
      };
      reader.readAsDataURL(file);
    });

    // Window Resize & Orientation Change Listener (Responsive Hand & HUD updates)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.updateLanguageUI();
        if (this.gameState && this.gameState.hands && this.gameState.hands[0]) {
          this.renderHandsAndCounts(false);
        }
      }, 150);
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateLanguageUI();
        if (this.gameState && this.gameState.hands && this.gameState.hands[0]) {
          this.renderHandsAndCounts(false);
        }
      }, 250);
    });
  }

  renderPlayerAvatars() {
    for (let i = 0; i < 4; i++) {
      const el = this.avatarIconEls[i];
      const avatarVal = this.playerAvatars[i];
      if (el && avatarVal) {
        if (avatarVal.startsWith('data:image') || avatarVal.startsWith('http') || avatarVal.startsWith('blob:')) {
          el.innerHTML = `<img src="${avatarVal}" alt="Avatar" />`;
        } else {
          el.textContent = avatarVal;
        }
      }
    }
  }

  openAvatarChooser(playerId) {
    this.currentEditingPlayerId = playerId;
    const isBn = this.currentLanguage === 'bn';
    const pName = isBn ? PLAYERS[playerId].nameBn : PLAYERS[playerId].nameEn;
    
    this.avatarTargetName.textContent = isBn 
      ? `${pName}-এর জন্য অবতার বা ছবি নির্বাচন করুন:` 
      : `Select avatar or upload custom photo for ${pName}:`;

    // Populate preset avatar items
    this.avatarPresetsGrid.innerHTML = PRESET_AVATARS.map(preset => {
      const isSelected = this.playerAvatars[playerId] === preset.icon;
      return `
        <div class="avatar-preset-item ${isSelected ? 'selected' : ''}" data-icon="${preset.icon}">
          <span class="avatar-preset-icon">${preset.icon}</span>
          <span class="avatar-preset-label">${preset.label}</span>
        </div>
      `;
    }).join('');

    this.avatarPresetsGrid.querySelectorAll('.avatar-preset-item').forEach(item => {
      item.addEventListener('click', () => {
        this.sound.playButtonClick();
        const icon = item.dataset.icon;
        this.setPlayerAvatar(this.currentEditingPlayerId, icon);
        this.modalAvatarChooser.classList.remove('active');
      });
    });

    this.modalAvatarChooser.classList.add('active');
  }

  setPlayerAvatar(playerId, avatarVal) {
    this.playerAvatars[playerId] = avatarVal;
    try {
      localStorage.setItem('twenty_nine_avatar_' + playerId, avatarVal);
    } catch (err) {
      console.warn('Could not persist avatar to localStorage:', err);
    }
    this.renderPlayerAvatars();

    const isBn = this.currentLanguage === 'bn';
    const pName = isBn ? PLAYERS[playerId].nameBn : PLAYERS[playerId].nameEn;
    this.showToast(isBn ? `${pName}-এর অবতার আপডেট হয়েছে` : `${pName}'s avatar updated!`);
  }

  updateLanguageUI() {
    const isBn = this.currentLanguage === 'bn';
    this.langIndicator.textContent = isBn ? 'বাং' : 'EN';
    document.documentElement.lang = isBn ? 'bn' : 'en';

    for (let i = 0; i < 4; i++) {
      if (this.playerNames[i]) {
        this.playerNames[i].textContent = isBn ? PLAYERS[i].nameBn : PLAYERS[i].nameEn;
      }
    }

    const isNarrow = window.innerWidth < 900;
    if (isNarrow) {
      this.labelTeam1.textContent = (isBn ? 'আমরা' : 'You') + ':';
      this.labelTeam2.textContent = (isBn ? 'বিপক্ষ' : 'Opp') + ':';
    } else {
      this.labelTeam1.textContent = (isBn ? TEAMS.TEAM_1.nameBn : TEAMS.TEAM_1.nameEn) + ':';
      this.labelTeam2.textContent = (isBn ? TEAMS.TEAM_2.nameBn : TEAMS.TEAM_2.nameEn) + ':';
    }
    this.brandTitle.textContent = isBn ? '২৯ (Twenty-Nine) • বাংলাদেশ স্ট্যান্ডার্ড' : 'Twenty-Nine • Bangladesh Standard';

    this.textRevealTrump.textContent = isBn ? 'রং তোলা (Reveal Trump)' : 'Reveal Trump';
    this.textClaimMarriage.textContent = isBn ? 'জোড়া দেখান (Claim Marriage)' : 'Claim Marriage';
    this.labelYourBid.textContent = isBn ? 'আপনার ডাক (Your Turn to Bid)' : 'Your Turn to Bid';
    this.btnDockPass.textContent = isBn ? 'পাস (Pass)' : 'Pass';
    this.btnDockSubmit.textContent = isBn ? 'ডাক দিন (Submit Bid)' : 'Submit Bid';

    this.rulesContent.innerHTML = isBn ? `
      <div>
        <strong style="color:var(--primary-accent);">১. কার্ডের শক্তি ও পয়েন্ট (Hierarchy & Points):</strong><br>
        প্রতিটি সুটে ৩২টি কার্ডের র‍্যাঙ্কিং:<br>
        • <strong>J (গোলাম):</strong> ৩ পয়েন্ট (সর্বোচ্চ পাওয়ার)<br>
        • <strong>9 (নহলা):</strong> ২ পয়েন্ট<br>
        • <strong>A (টেক্কা):</strong> ১ পয়েন্ট<br>
        • <strong>10 (দহলা):</strong> ১ পয়েন্ট<br>
        • <strong>K, Q, 8, 7:</strong> ০ পয়েন্ট<br>
        মোট তাস পয়েন্ট = ২৮। ৮ম (শেষ) ট্রিক জিতলে <strong>+১ বোনাস পয়েন্ট</strong> = মোট <strong>২৯ পয়েন্ট</strong>।
      </div>
      <div>
        <strong style="color:var(--primary-accent);">২. ডাক ও ট্রাম্প (Bidding & Trump):</strong><br>
        শুরুতে ৪টি কার্ড ডিল হয়। খেলোয়াড়রা ১৬ থেকে ২৮ পর্যন্ত ডাক দিতে পারেন। সর্বোচ্চ বিডার গোপন ট্রাম্প নির্বাচন করেন। এরপর বাকি ৪টি কার্ড ডিল হয় (মোট ৮টি কার্ড)।
      </div>
      <div>
        <strong style="color:var(--primary-accent);">৩. সুট মানা ও ট্রাম্প রিভিল:</strong><br>
        লিড সুটের তাস থাকলে অবশ্যই তা খেলতে হবে। না থাকলে অন্য তাস ফেলা যায় অথবা <em>"রং তোলা"</em> বোতাম চেপে ট্রাম্প খোলা যায়। ট্রাম্প খুললে সেই ট্রিকে ট্রাম্প ফেলা বাধ্যতামূলক।
      </div>
      <div>
        <strong style="color:var(--accent-gold);">৪. জোড়া / ম্যারেজ রুল (Marriage Rule):</strong><br>
        ট্রাম্প খোলার পর কোনো দলের কাছে ট্রাম্পের <strong>King (K)</strong> ও <strong>Queen (Q)</strong> থাকলে জোড়া ঘোষণা করা যায়। বিডিং দলের থাকলে টার্গেট ৪ কমে, ডিফেন্ডিং দলের থাকলে টার্গেট ৪ বাড়ে।
      </div>
      <div>
        <strong style="color:var(--tertiary-accent);">৫. ম্যাচ স্কোর (Red vs Black Points):</strong><br>
        রাউন্ড জিতলে লাল পয়েন্ট পাওয়া যায়। যে দল আগে <strong>৬ গেম পয়েন্ট</strong> অর্জন করে তারা ম্যাচ জয়ী হয়!
      </div>
    ` : `
      <div>
        <strong style="color:var(--primary-accent);">1. Card Hierarchy & Points:</strong><br>
        Rank order in every suit:<br>
        • <strong>J (Jack):</strong> 3 points (Highest Power)<br>
        • <strong>9 (Nine):</strong> 2 points<br>
        • <strong>A (Ace):</strong> 1 point<br>
        • <strong>10 (Ten):</strong> 1 point<br>
        • <strong>K, Q, 8, 7:</strong> 0 points<br>
        Total card points = 28 + 1 bonus point for final trick = <strong>29 Points</strong>.
      </div>
      <div>
        <strong style="color:var(--primary-accent);">2. Bidding & Trump:</strong><br>
        4 cards dealt initially. Bidding ranges from 16 to 28. Winner locks the secret Trump. Then remaining 4 cards are dealt (8 cards each).
      </div>
      <div>
        <strong style="color:var(--primary-accent);">3. Follow Suit & Reveal Trump:</strong><br>
        Must follow lead suit. If void, you can discard or click <em>"Reveal Trump"</em>. Once opened, you must play a trump card on that trick.
      </div>
      <div>
        <strong style="color:var(--accent-gold);">4. Marriage Rule (K + Q of Trump):</strong><br>
        If a team holds both K & Q of Trump after trump is revealed, target drops by 4 for bidder team or increases by 4 for defenders.
      </div>
      <div>
        <strong style="color:var(--tertiary-accent);">5. Match Points:</strong><br>
        First team to reach <strong>6 Game Points</strong> wins the match!
      </div>
    `;

    if (this.titleAvatarModal) {
      this.titleAvatarModal.textContent = isBn ? 'প্রোফাইল অবতার নির্বাচন' : 'Select Profile Avatar';
    }
    if (this.textUploadAvatar) {
      this.textUploadAvatar.textContent = isBn ? 'কাস্টম ছবি বা ফটো আপলোড করুন' : 'Upload Custom Photo / Icon';
    }
    if (this.btnCloseAvatarModal) {
      this.btnCloseAvatarModal.textContent = isBn ? 'সম্পন্ন' : 'Close';
    }

    if (this.hudTargetTitle) {
      this.hudTargetTitle.textContent = isBn ? '🎯 লক্ষ্য:' : '🎯 Target:';
    }

    if (this.gameState && this.gameState.isTrumpRevealed && this.gameState.trumpSuit) {
      const badge = this.hudTrumpSlot.querySelector('.hud-trump-badge');
      const title = this.hudTrumpSlot.querySelector('.hud-trump-title');
      if (badge) badge.textContent = isBn ? 'ট্রাম্প' : 'TRUMP';
      if (title) {
        const sObj = SUITS[this.gameState.trumpSuit];
        if (sObj) title.textContent = isBn ? sObj.nameBn : sObj.nameEn;
      }
    } else {
      if (this.hudTrumpLabel) {
        const bidder = this.gameState ? this.gameState.highestBidder : null;
        const trumpSuit = this.gameState ? this.gameState.trumpSuit : null;
        if (bidder === 0 && trumpSuit && this.gameState.phase !== GAME_PHASES.BIDDING) {
          this.hudTrumpLabel.textContent = `${isBn ? 'রং:' : 'Trump:'} ${SUITS[trumpSuit].symbol} (${isBn ? 'গোপন' : 'Hidden'})`;
        } else {
          this.hudTrumpLabel.textContent = isBn ? 'রং: গোপন' : 'Trump: Hidden';
        }
      }
    }
  }

  initGame() {
    this.updateScoreLedger();
    this.resetTableForNewRound();
    this.gameState.startNewRound();
  }

  renderHudTrumpHidden(labelOverride = null) {
    const isBn = this.currentLanguage === 'bn';
    const text = labelOverride || (isBn ? 'রং: গোপন' : 'Trump: Hidden');
    this.hudTrumpSlot.className = 'trump-indicator-slot';
    this.hudTrumpSlot.innerHTML = `
      <span class="trump-indicator-icon" id="hud-trump-icon">🔒</span>
      <span id="hud-trump-label">${text}</span>
    `;
    this.hudTrumpIcon = document.getElementById('hud-trump-icon');
    this.hudTrumpLabel = document.getElementById('hud-trump-label');
  }

  resetTableForNewRound() {
    this.slotNorth.innerHTML = '';
    this.slotWest.innerHTML = '';
    this.slotEast.innerHTML = '';
    this.slotSouth.innerHTML = '';
    this.trickCurrentPoints.textContent = '0 pts';
    this.trickRoundLabel.textContent = this.currentLanguage === 'bn' ? 'হাত ১ / ৮ (Trick 1/8)' : 'Trick 1 / 8';
    this.renderHudTrumpHidden();
    this.hudTargetVal.textContent = '--';

    this.btnRevealTrump.style.display = 'none';
    this.btnClaimMarriage.style.display = 'none';
    this.challengeBanner.style.display = 'none';
    this.floatingBiddingPanel.classList.remove('active');

    for (let i = 0; i < 4; i++) {
      if (this.crowns[i]) this.crowns[i].style.display = 'none';
      if (this.pods[i]) this.pods[i].classList.remove('is-bidder', 'active-turn');
    }

    this.ai.resetMemory();
  }

  showToast(message, isMarriage = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isMarriage ? 'toast-marriage' : ''}`;
    toast.innerHTML = `<span>${isMarriage ? '👑' : '🔔'}</span> ${message}`;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  showSpeechBubble(playerId, text) {
    const pod = this.pods[playerId];
    if (!pod) return;
    const oldBubble = pod.querySelector('.speech-bubble');
    if (oldBubble) oldBubble.remove();

    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    bubble.textContent = text;
    pod.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2400);
  }

  updateScoreLedger() {
    const s1 = this.gameState.matchScores.team1;
    const s2 = this.gameState.matchScores.team2;
    this.scoreTeam1Val.textContent = s1;
    this.scoreTeam2Val.textContent = s2;

    const pips1 = this.team1Pips.children;
    for (let i = 0; i < 6; i++) {
      pips1[i].className = i < s1 ? 'pip pip-red' : 'pip';
    }

    const pips2 = this.team2Pips.children;
    for (let i = 0; i < 6; i++) {
      pips2[i].className = i < s2 ? 'pip pip-red' : 'pip';
    }
  }

  /**
   * Renders South Hand with Wide, Full-Brightness Fan Layout
   */
  renderHandsAndCounts(playDealSound = true) {
    if (playDealSound) {
      this.sound.playDeal();
    }

    const southHand = this.gameState.hands[0];
    this.playerHandContainer.innerHTML = '';

    const numCards = southHand.length;
    const containerWidth = this.playerHandContainer.clientWidth || window.innerWidth;

    // Read responsive card width from CSS variables or fallback
    const rootStyle = getComputedStyle(document.documentElement);
    const cardWidth = parseFloat(rootStyle.getPropertyValue('--card-width')) || 62;

    // Available width for fan without horizontal overflow
    const maxAvailableWidth = Math.max(containerWidth - cardWidth - 12, 100);
    const defaultSpread = numCards <= 4 ? 68 : 40;
    const totalRequired = Math.max(numCards - 1, 1) * defaultSpread;
    const spreadX = totalRequired > maxAvailableWidth
      ? Math.max(14, Math.floor(maxAvailableWidth / Math.max(numCards - 1, 1)))
      : defaultSpread;

    const spreadRatio = defaultSpread > 0 ? spreadX / defaultSpread : 1;
    const arcAngle = (numCards <= 4 ? 2.5 : 3.4) * spreadRatio;

    southHand.forEach((card, idx) => {
      // ONLY dim during trick playing if it is South's turn and the card cannot legally be played
      let isDimmed = false;
      if (this.gameState.currentPhase === GAME_PHASES.PLAYING) {
        if (this.gameState.currentTurn === 0) {
          isDimmed = !this.gameState.isCardPlayable(0, card);
        }
      }

      const cardEl = CardRenderer.createCardElement(card, {
        isDimmed: isDimmed,
        isFaceUp: true
      });

      const mid = (numCards - 1) / 2;
      const offset = idx - mid;
      const angle = (offset * arcAngle).toFixed(2);
      const translateY = (Math.abs(offset) * 2.2 * spreadRatio).toFixed(1);
      const translateX = (offset * spreadX).toFixed(1);

      cardEl.style.setProperty('--card-x', `${translateX}px`);
      cardEl.style.setProperty('--card-y', `${translateY}px`);
      cardEl.style.setProperty('--card-rot', `${angle}deg`);
      cardEl.style.zIndex = idx + 10;

      cardEl.addEventListener('click', () => {
        if (this.gameState.currentPhase !== GAME_PHASES.PLAYING || this.gameState.currentTurn !== 0) {
          return;
        }

        if (!this.gameState.isCardPlayable(0, card)) {
          cardEl.classList.add('shake');
          this.sound.playButtonClick();
          setTimeout(() => cardEl.classList.remove('shake'), 400);
          return;
        }

        this.gameState.playCard(0, card.id);
      });

      this.playerHandContainer.appendChild(cardEl);
    });

    this.renderStubs();
    this.checkRevealTrumpButton();
    this.checkMarriageButton();
  }

  renderStubs() {
    const cNorth = this.gameState.hands[2].length;
    const cWest = this.gameState.hands[3].length;
    const cEast = this.gameState.hands[1].length;

    this.counts[2].textContent = `${cNorth} cards`;
    this.counts[3].textContent = `${cWest} cards`;
    this.counts[1].textContent = `${cEast} cards`;

    this.northStubs.innerHTML = '';
    for (let i = 0; i < cNorth; i++) {
      const s = document.createElement('div');
      s.className = 'north-card-stub';
      this.northStubs.appendChild(s);
    }

    this.westStubs.innerHTML = '';
    for (let i = 0; i < cWest; i++) {
      const s = document.createElement('div');
      s.className = 'west-card-stub';
      this.westStubs.appendChild(s);
    }

    this.eastStubs.innerHTML = '';
    for (let i = 0; i < cEast; i++) {
      const s = document.createElement('div');
      s.className = 'east-card-stub';
      this.eastStubs.appendChild(s);
    }
  }

  checkRevealTrumpButton() {
    if (this.gameState.currentPhase === GAME_PHASES.PLAYING 
        && this.gameState.currentTurn === 0 
        && !this.gameState.isTrumpRevealed 
        && this.gameState.leadSuit) {
      
      const hasLeadSuit = this.gameState.hands[0].some(c => c.suit === this.gameState.leadSuit);
      if (!hasLeadSuit) {
        this.btnRevealTrump.style.display = 'flex';
        return;
      }
    }
    this.btnRevealTrump.style.display = 'none';
  }

  checkMarriageButton() {
    if (this.gameState.isTrumpRevealed && !this.gameState.marriageClaimed.team1) {
      const hand = this.gameState.hands[0];
      const hasK = hand.some(c => c.suit === this.gameState.trumpSuit && c.rank === 'K');
      const hasQ = hand.some(c => c.suit === this.gameState.trumpSuit && c.rank === 'Q');
      if (hasK && hasQ) {
        this.btnClaimMarriage.style.display = 'flex';
        return;
      }
    }
    this.btnClaimMarriage.style.display = 'none';
  }

  handleBiddingTurn(bidderId) {
    this.updateActivePod(bidderId);

    if (bidderId === 0) {
      const minPossible = Math.max(BID_RULES.MIN_BID, this.gameState.highestBid + 1);
      this.selectedBid = minPossible;
      
      this.dockHighestBidLabel.textContent = this.gameState.highestBid > 0 
        ? `${this.currentLanguage === 'bn' ? 'বর্তমান ডাক:' : 'Current:'} ${this.gameState.highestBid}` 
        : (this.currentLanguage === 'bn' ? 'ডাক শুরু করুন' : 'Open Bid');

      this.quickBidChips.querySelectorAll('.chip-bid').forEach(chip => {
        const val = parseInt(chip.dataset.val, 10);
        chip.disabled = val < minPossible;
        chip.classList.toggle('selected', val === minPossible);
      });

      this.floatingBiddingPanel.classList.add('active');
    } else {
      this.floatingBiddingPanel.classList.remove('active');
      this.statusTags[bidderId].textContent = this.currentLanguage === 'bn' ? 'ভাবছে...' : 'Thinking...';
      
      setTimeout(() => {
        const hand = this.gameState.hands[bidderId];
        const bid = this.ai.evaluateBid(bidderId, hand, this.gameState.highestBid, this.gameState.highestBidder);
        this.gameState.submitBid(bidderId, bid);
      }, 750);
    }
  }

  onBidPlaced(data) {
    const { playerId, bidAmount, isPass } = data;
    const pName = this.currentLanguage === 'bn' ? PLAYERS[playerId].nameBn : PLAYERS[playerId].nameEn;

    if (isPass) {
      this.statusTags[playerId].textContent = this.currentLanguage === 'bn' ? 'পাস' : 'Passed';
      this.showSpeechBubble(playerId, this.currentLanguage === 'bn' ? 'পাস!' : 'Pass!');
      this.showToast(`${pName}: ${this.currentLanguage === 'bn' ? 'পাস করেছেন' : 'Passed'}`);
    } else {
      this.statusTags[playerId].textContent = `${this.currentLanguage === 'bn' ? 'ডাক:' : 'Bid:'} ${bidAmount}`;
      this.hudTargetVal.textContent = bidAmount;
      this.showSpeechBubble(playerId, `${bidAmount}`);
      this.showToast(`${pName}: ${bidAmount}`);
      this.sound.playButtonClick();
    }
  }

  onBiddingConcluded(data) {
    const { winner, winningBid } = data;
    this.floatingBiddingPanel.classList.remove('active');
    this.crowns[winner].style.display = 'block';
    this.pods[winner].classList.add('is-bidder');
    this.hudTargetVal.textContent = winningBid;

    const winnerName = this.currentLanguage === 'bn' ? PLAYERS[winner].nameBn : PLAYERS[winner].nameEn;
    this.showSpeechBubble(winner, `🏆 ${winningBid}!`);
    this.showToast(`🎯 ${winnerName} ${winningBid} ${this.currentLanguage === 'bn' ? 'পয়েন্টে ডাক জিতেছেন!' : 'won the bid!'}`);

    if (winner === 0) {
      setTimeout(() => {
        this.modalTrumpSelect.classList.add('active');
      }, 500);
    } else {
      this.statusTags[winner].textContent = this.currentLanguage === 'bn' ? 'রং বাছাই করছে...' : 'Picking Trump...';
      setTimeout(() => {
        const bestSuit = this.ai.pickTrumpSuit(this.gameState.hands[winner]);
        this.gameState.selectTrump(bestSuit, false);
      }, 850);
    }
  }

  onTrumpSelected(data) {
    const { bidder, isSeventhCard, trumpSuit } = data;
    const isBn = this.currentLanguage === 'bn';

    const labelText = (bidder === 0 && trumpSuit)
      ? `${isBn ? 'রং:' : 'Trump:'} ${SUITS[trumpSuit].symbol} (${isBn ? 'গোপন' : 'Hidden'})` 
      : (isBn ? 'রং: গোপন' : 'Trump: Hidden');
    this.renderHudTrumpHidden(labelText);

    const pName = isBn ? PLAYERS[bidder].nameBn : PLAYERS[bidder].nameEn;
    this.showToast(`${pName} ${isBn ? 'ট্রাম্প গোপন করেছেন' : 'locked the Trump card'}`);
  }

  handleChallengePhase(data) {
    const { bidderTeam } = data;
    if (bidderTeam === 2) {
      this.challengeText.textContent = this.currentLanguage === 'bn' 
        ? `প্রতিপক্ষ ${data.highestBid} ডাক দিয়েছে। ডাবল (x2 পয়েন্ট) চ্যালেঞ্জ করবেন?`
        : `Opponents bid ${data.highestBid}. Challenge with Double (x2 points)?`;
      this.challengeBanner.style.display = 'flex';
    } else {
      setTimeout(() => {
        this.gameState.startPlayingTricks();
      }, 700);
    }
  }

  onChallengeAnnounced(data) {
    const { type, team } = data;
    const teamName = team === 1 
      ? (this.currentLanguage === 'bn' ? TEAMS.TEAM_1.nameBn : TEAMS.TEAM_1.nameEn)
      : (this.currentLanguage === 'bn' ? TEAMS.TEAM_2.nameBn : TEAMS.TEAM_2.nameEn);
    this.showToast(`⚡ ${teamName}: ${type}!`, true);
    this.sound.playTrumpReveal();
  }

  onTrickStarted(data) {
    const { trickNumber, leader } = data;
    const isBn = this.currentLanguage === 'bn';
    this.trickRoundLabel.textContent = isBn ? `হাত ${trickNumber} / ৮` : `Trick ${trickNumber} / 8`;
    this.trickCurrentPoints.textContent = '0 pts';

    // Slots are cleared smoothly at the start of new trick
    this.slotNorth.innerHTML = '';
    this.slotWest.innerHTML = '';
    this.slotEast.innerHTML = '';
    this.slotSouth.innerHTML = '';

    this.onTurnChanged(leader);
  }

  onTurnChanged(currentTurn) {
    this.updateActivePod(currentTurn);
    this.renderHandsAndCounts();

    if (currentTurn !== 0 && this.gameState.currentPhase === GAME_PHASES.PLAYING) {
      this.statusTags[currentTurn].textContent = this.currentLanguage === 'bn' ? 'খেলছে...' : 'Playing...';
      if (this.aiTurnTimeout) clearTimeout(this.aiTurnTimeout);

      this.aiTurnTimeout = setTimeout(() => {
        const decision = this.ai.decidePlay(currentTurn, this.gameState);
        if (decision.speech) {
          this.showSpeechBubble(currentTurn, decision.speech);
        }

        if (decision.action === 'reveal_trump') {
          this.gameState.revealTrump(currentTurn);
          setTimeout(() => {
            const secondDecision = this.ai.decidePlay(currentTurn, this.gameState);
            this.gameState.playCard(currentTurn, secondDecision.card.id);
          }, 750);
        } else {
          this.gameState.playCard(currentTurn, decision.card.id);
        }
      }, this.gameState.settings.aiSpeed || 700);
    }
  }

  updateActivePod(activeId) {
    for (let i = 0; i < 4; i++) {
      if (this.pods[i]) {
        if (i === activeId) {
          this.pods[i].classList.add('active-turn');
          this.statusTags[i].textContent = i === 0 
            ? (this.currentLanguage === 'bn' ? 'আপনার চাল' : 'Your Turn') 
            : (this.currentLanguage === 'bn' ? 'চাল দিচ্ছে' : 'Active');
        } else {
          this.pods[i].classList.remove('active-turn');
        }
      }
    }
  }

  onCardPlayed(data) {
    const { playerId, card, trick } = data;
    this.sound.playCardPlay();
    this.ai.recordPlayedCard(card);

    const slotMap = { 0: this.slotSouth, 1: this.slotEast, 2: this.slotNorth, 3: this.slotWest };
    const targetSlot = slotMap[playerId];
    targetSlot.innerHTML = '';

    const cardEl = CardRenderer.createCardElement(card, { isDimmed: false, isFaceUp: true });
    const randomAngle = (Math.random() * 8 - 4).toFixed(1);
    cardEl.style.setProperty('--card-x', '0px');
    cardEl.style.setProperty('--card-y', '0px');
    cardEl.style.setProperty('--card-rot', `${randomAngle}deg`);
    cardEl.classList.add('trick-card-played');
    targetSlot.appendChild(cardEl);

    const currentPoints = trick.reduce((acc, p) => acc + p.card.points, 0);
    this.trickCurrentPoints.textContent = `${currentPoints} pts`;

    this.renderHandsAndCounts();
  }

  onTrumpRevealed(data) {
    const { playerId, trumpSuit, trumpCard } = data;
    const isBn = this.currentLanguage === 'bn';
    this.sound.playTrumpReveal();

    const suitObj = SUITS[trumpSuit] || { symbol: '♦', color: 'red', nameEn: 'Diamonds', nameBn: 'ডায়মন্ডস' };
    const suitName = isBn ? suitObj.nameBn : suitObj.nameEn;
    const suitSymbolColor = suitObj.color === 'red' ? 'var(--suit-red)' : 'var(--text-primary)';

    // Pick authentic card to render: use the locked trump card or fallback to Ace of that suit
    const displayCard = (trumpCard && trumpCard.rank && trumpCard.rank !== '?')
      ? trumpCard
      : { suit: trumpSuit, rank: 'A', points: 1, power: 6, id: `trump_rev_${Date.now()}` };

    this.hudTrumpSlot.className = 'trump-indicator-slot revealed has-hanging-card trump-reveal-pulse';
    this.hudTrumpSlot.innerHTML = `
      <span class="hud-trump-icon-symbol" style="color: ${suitSymbolColor};">${suitObj.symbol}</span>
      <div class="hud-trump-meta">
        <span class="hud-trump-badge">${isBn ? 'ট্রাম্প' : 'TRUMP'}</span>
        <span class="hud-trump-title">${suitName}</span>
      </div>
      <div class="hud-hanging-trump-card" title="${suitName}">
        <div class="hud-hanging-connector"></div>
        <div class="hud-hanging-card-inner">
          ${CardRenderer.renderFaceSVG(displayCard)}
        </div>
      </div>
    `;

    const pName = isBn ? PLAYERS[playerId].nameBn : PLAYERS[playerId].nameEn;
    this.showSpeechBubble(playerId, `🎺 ${suitName}!`);
    this.showToast(`🎺 ${pName} ${isBn ? 'রং প্রকাশ করেছেন:' : 'revealed Trump:'} ${suitName} (${suitObj.symbol})!`);

    this.renderHandsAndCounts();
  }

  onMarriageAnnounced(data) {
    const { teamId, isBiddingTeam, originalBid, newBid } = data;
    const isBn = this.currentLanguage === 'bn';
    this.sound.playMarriage();
    this.hudTargetVal.textContent = newBid;

    const teamName = teamId === 1 
      ? (isBn ? TEAMS.TEAM_1.nameBn : TEAMS.TEAM_1.nameEn) 
      : (isBn ? TEAMS.TEAM_2.nameBn : TEAMS.TEAM_2.nameEn);

    const message = isBiddingTeam 
      ? `👑 ${isBn ? 'জোড়া/ম্যারেজ!' : 'Marriage!'} ${teamName} held K & Q! ${isBn ? 'টার্গেট কমল:' : 'Target reduced:'} ${originalBid} ➔ ${newBid}!` 
      : `👑 ${isBn ? 'জোড়া/ম্যারেজ!' : 'Marriage!'} ${teamName} held K & Q! ${isBn ? 'টার্গেট বাড়ল:' : 'Target increased:'} ${originalBid} ➔ ${newBid}!`;

    this.showToast(message, true);
  }

  onTrickResolved(data) {
    const { winnerId, points } = data;
    const isBn = this.currentLanguage === 'bn';
    this.sound.playTrickWin();

    if (points > 0) {
      const particle = document.createElement('div');
      particle.className = 'floating-points-particle';
      particle.textContent = `+${points} pts`;
      this.trickArena.appendChild(particle);
      setTimeout(() => particle.remove(), 1200);
    }

    // Precise fly-to-winner animation: collect cards into winning player's pod
    const winnerPod = this.pods[winnerId];
    if (winnerPod) {
      const winnerRect = winnerPod.getBoundingClientRect();
      const targetX = winnerRect.left + winnerRect.width / 2;
      const targetY = winnerRect.top + winnerRect.height / 2;

      // Celebrate trick winner avatar with subtle pulse & glow
      winnerPod.classList.add('winner-pod-pulse');
      setTimeout(() => winnerPod.classList.remove('winner-pod-pulse'), 850);

      const slots = [this.slotSouth, this.slotEast, this.slotNorth, this.slotWest];
      slots.forEach((slot, idx) => {
        const card = slot.querySelector('.playing-card');
        if (card) {
          const cardRect = card.getBoundingClientRect();
          const cardX = cardRect.left + cardRect.width / 2;
          const cardY = cardRect.top + cardRect.height / 2;
          const deltaX = targetX - cardX;
          const deltaY = targetY - cardY;

          // Clear any active drop-in animation so transition can animate transform smoothly
          card.classList.remove('trick-card-played');
          card.style.animation = 'none';
          void card.offsetWidth; // Force reflow

          // Stagger card flight smoothly towards winner's pod
          const delaySec = idx * 0.04;
          card.style.transition = `transform 0.72s cubic-bezier(0.2, 0.85, 0.3, 1) ${delaySec}s, opacity 0.55s ease ${delaySec + 0.15}s, filter 0.6s ease`;
          card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.24) rotate(${(idx - 1.5) * 14}deg)`;
          card.style.opacity = '0';
          card.style.pointerEvents = 'none';
        }
      });
    }

    const wName = isBn ? PLAYERS[winnerId].nameBn : PLAYERS[winnerId].nameEn;
    this.showSpeechBubble(winnerId, `+${points}`);
    this.showToast(`${wName} ${isBn ? 'হাত জিতেছেন' : 'takes the trick'} (+${points} pts)`);
  }

  onRoundEnded(data) {
    const { bidder, targetBid, pointsMade, isBidAchieved, gamePointsDelta, matchScores, isMatchWon, winnerTeam } = data;
    const isBn = this.currentLanguage === 'bn';
    this.updateScoreLedger();

    if (isBidAchieved && PLAYERS[bidder].team === 1) {
      this.sound.playRoundWin();
    } else if (!isBidAchieved && PLAYERS[bidder].team === 2) {
      this.sound.playRoundWin();
    } else {
      this.sound.playRoundLoss();
    }

    const bidderName = isBn ? PLAYERS[bidder].nameBn : PLAYERS[bidder].nameEn;

    if (isMatchWon) {
      this.matchOverTitle.innerHTML = winnerTeam === 1 
        ? `<span>🎉</span> ${isBn ? 'অভিনন্দন! আপনি ম্যাচ জিতেছেন!' : 'Congratulations! You Won the Match!'}` 
        : `<span>💔</span> ${isBn ? 'ম্যাচ সমাপ্ত - প্রতিপক্ষ জয়ী' : 'Match Over - Opponents Won'}`;

      this.matchOverBody.innerHTML = `
        <div style="font-size:1.05rem; margin-bottom:12px;">
          ${isBn ? 'চূড়ান্ত ম্যাচ স্কোর:' : 'Final Match Score:'} 
          <strong>${isBn ? TEAMS.TEAM_1.nameBn : TEAMS.TEAM_1.nameEn} (${matchScores.team1})</strong> vs 
          <strong>${isBn ? TEAMS.TEAM_2.nameBn : TEAMS.TEAM_2.nameEn} (${matchScores.team2})</strong>
        </div>
        <div>${isBn ? 'টার্গেট ৬ গেম পয়েন্ট পূর্ণ হয়েছে।' : 'Target 6 Game Points achieved.'}</div>
      `;
      this.modalMatchOver.classList.add('active');
    } else {
      this.roundResultTitle.innerHTML = isBidAchieved 
        ? `<span>🏆</span> ${isBn ? 'ডাক সফল হয়েছে' : 'Bid Made'} (${pointsMade} / ${targetBid} pts)` 
        : `<span>💥</span> ${isBn ? 'ডাক ব্যর্থ হয়েছে (ডাউন/সেট)' : 'Bid Failed / Set'} (${pointsMade} / ${targetBid} pts)`;

      const winnerTeamName = isBidAchieved 
        ? (PLAYERS[bidder].team === 1 ? (isBn ? TEAMS.TEAM_1.nameBn : TEAMS.TEAM_1.nameEn) : (isBn ? TEAMS.TEAM_2.nameBn : TEAMS.TEAM_2.nameEn))
        : (PLAYERS[bidder].team === 1 ? (isBn ? TEAMS.TEAM_2.nameBn : TEAMS.TEAM_2.nameEn) : (isBn ? TEAMS.TEAM_1.nameBn : TEAMS.TEAM_1.nameEn));

      this.roundResultBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div>${isBn ? 'বিডার:' : 'Bidder:'} <strong>${bidderName}</strong></div>
          <div>${isBn ? 'টার্গেট পয়েন্ট:' : 'Target:'} <strong>${targetBid} pts</strong> | ${isBn ? 'অর্জিত:' : 'Made:'} <strong>${pointsMade} pts</strong></div>
          <div>${isBn ? 'রাউন্ডের ফল:' : 'Round Outcome:'} <strong>${winnerTeamName}</strong> <strong>+${gamePointsDelta}</strong> ${isBn ? 'গেম পয়েন্ট পেল।' : 'Game Point(s).' }</div>
          <div style="margin-top:8px; color:var(--text-primary); font-family:var(--font-mono);">
            ${isBn ? 'মোট স্কোর:' : 'Overall Score:'} ${isBn ? TEAMS.TEAM_1.nameBn : TEAMS.TEAM_1.nameEn}: ${matchScores.team1} | ${isBn ? TEAMS.TEAM_2.nameBn : TEAMS.TEAM_2.nameEn}: ${matchScores.team2}
          </div>
        </div>
      `;
      this.modalRoundEnd.classList.add('active');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new TwentyNineApp();
});

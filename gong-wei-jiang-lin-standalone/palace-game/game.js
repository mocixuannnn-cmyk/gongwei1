(() => {
  const $ = (id) => document.getElementById(id);
  const statNames = {
    beauty: "容貌", grace: "气质", wit: "聪慧", social: "交际",
    luck: "幸运", health: "健康", fertility: "孕率"
  };
  const skillNames = ["女红", "诗书", "舞蹈", "乐曲", "医学", "香料"];
  const names = ["沈令仪", "顾清漪", "裴明棠", "陆知微", "谢昭宁", "苏婉兮", "柳月华", "萧云筝", "林若蘅", "容含章", "秦映雪", "楚如晦", "贺兰长乐", "司徒玉衡", "慕容知意"];
  const givenNames = ["令仪", "清漪", "明棠", "知微", "昭宁", "婉兮", "月华", "云筝", "若蘅", "含章", "映雪", "如晦", "长乐", "玉衡", "知意", "兰因", "听雨", "疏影"];
  const childNames = {
    boy: ["承安", "景行", "知远", "弘文", "怀瑾", "明允", "承煦", "元昭"],
    girl: ["明珠", "令月", "嘉宁", "昭华", "如意", "玉真", "静姝", "安和"]
  };
  const childTraits = ["沉静", "聪敏", "仁厚", "活泼", "果敢", "温良", "好学", "倔强"];
  const surnames = ["沈", "顾", "裴", "陆", "谢", "苏", "柳", "萧", "林", "容", "秦", "楚", "慕容", "司徒", "贺兰"];
  const families = [
    { name: "一品文官之女", weight: 9, bonus: 12 }, { name: "二品文官之女", weight: 8, bonus: 10 },
    { name: "三品文官之女", weight: 7, bonus: 8 }, { name: "四品文官之女", weight: 6, bonus: 6 },
    { name: "五品文官之女", weight: 5, bonus: 4 }, { name: "六品文官之女", weight: 4, bonus: 2 },
    { name: "七品文官之女", weight: 3, bonus: 1 }, { name: "八品文官之女", weight: 2, bonus: 0 },
    { name: "九品文官之女", weight: 1, bonus: 0 }, { name: "一品武将之女", weight: 8, bonus: 11 },
    { name: "二品武将之女", weight: 7, bonus: 9 }, { name: "三品武将之女", weight: 6, bonus: 7 },
    { name: "四品武将之女", weight: 5, bonus: 5 }, { name: "五品武将之女", weight: 4, bonus: 3 },
    { name: "六品武将之女", weight: 3, bonus: 2 }, { name: "七品武将之女", weight: 2, bonus: 1 },
    { name: "八品武将之女", weight: 1, bonus: 0 }, { name: "九品武将之女", weight: 1, bonus: 0 },
    { name: "平民", weight: 2, bonus: 0 }, { name: "富商之女", weight: 4, bonus: 3 },
    { name: "皇商之女", weight: 7, bonus: 7 }
  ];
  const ranks = ["采女", "御女", "宝林", "才人", "美人", "婕妤", "充媛", "充容", "充仪", "修媛", "修容", "修仪", "昭媛", "昭容", "昭仪", "贤妃", "德妃", "淑妃", "贵妃"];
  const emperorTypes = ["温柔", "腹黑", "冷漠", "邪恶", "风流"];
  const colors = ["#d9bea1", "#dcc5ae", "#d5b8a1", "#e1c8aa", "#d4c3a3", "#cdb39c"];
  let setup = null;
  let game = null;
  let toastTimer = null;

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
  const pick = (list) => list[rand(0, list.length - 1)];
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
  const randomName = () => pick(surnames) + pick(givenNames);
  const randomFamily = () => {
    let roll = rand(1, families.reduce((sum, family) => sum + family.weight, 0));
    for (const family of families) {
      roll -= family.weight;
      if (roll <= 0) return family;
    }
    return families[0];
  };
  const rankFor = (stats, family) => {
    const average = ["beauty", "grace", "wit", "social", "luck", "health"]
      .reduce((sum, key) => sum + stats[key], 0) / 6;
    return ranks[clamp(Math.floor((average + family.bonus - 30) / 6.2), 0, ranks.length - 1)];
  };

  function makeSetup() {
    const family = randomFamily();
    const stats = {};
    Object.keys(statNames).forEach((key) => { stats[key] = rand(25, 85); });
    stats.fertility = rand(8, 86);
    const skills = {};
    skillNames.forEach((skill) => { skills[skill] = rand(0, 6); });
    return { family, stats, skills, talent: rand(0, 100), rank: rankFor(stats, family) };
  }

  function renderSetup() {
    $("familyValue").textContent = setup.family.name;
    $("statsPreview").innerHTML = Object.entries(setup.stats).map(([key, value]) => `
      <div class="stat-row"><span>${statNames[key]}</span><div class="bar"><i style="width:${value}%"></i></div>
      <strong>${value}${key === "fertility" ? "%" : ""}</strong></div>`).join("");
    $("skillsPreview").innerHTML = Object.entries(setup.skills).map(([name, value]) => `
      <div class="skill-chip"><span>${name}</span><b>${value.toFixed(1)}</b></div>`).join("");
  }

  function createCourt() {
    const people = [
      { name: "皇后·长孙氏", rank: "皇后", role: "皇后", authority: true, empress: true },
      { name: "萧贵妃", rank: "贵妃", role: "协理六宫", authority: true },
      { name: "柳淑妃", rank: "淑妃", role: "妃嫔" },
      { name: "贺兰德妃", rank: "德妃", role: "妃嫔" },
      { name: "裴贤妃", rank: "贤妃", role: "妃嫔" },
      { name: "顾昭仪", rank: "昭仪", role: "妃嫔" },
      { name: "苏婕妤", rank: "婕妤", role: "妃嫔" }
    ];
    return people.map((person, index) => ({
      ...person, id: `court-${index}`, color: colors[index % colors.length],
      favor: rand(20, 82), reputation: rand(35, 78), prestige: rand(28, 68),
      fertility: rand(12, 92), health: rand(55, 94), pregnancy: null, children: []
    }));
  }

  function startGame() {
    const name = $("playerName").value.trim() || randomName();
    game = {
      name, family: setup.family.name, familyBonus: setup.family.bonus,
      stats: { ...setup.stats }, skills: { ...setup.skills }, talent: setup.talent, rank: setup.rank,
      favor: rand(0, 100), favorRevealed: false, trueHeart: rand(0, 100),
      emperorType: pick(emperorTypes), age: 16, remainingLifeMonths: rand(360, 600), lifeRevealed: false,
      prestige: rand(22, 48), reputation: rand(35, 70), turn: 1, month: 1, year: 2, monthTurn: 1,
      court: createCourt(), relations: {}, children: [], pregnancy: null, rumors: [], log: [],
      acted: false, ended: false, playerFavoredThisMonth: false, plotSeen: []
    };
    game.court.forEach((person) => { game.relations[person.id] = 0; });
    $("profileName").textContent = name;
    if ($("portraitInitial")) $("portraitInitial").textContent = name.slice(0, 1);
    $("welcomeTitle").innerHTML = `${escapeHtml(name)}初入禁中，<em>花开有时</em>`;
    hide("introScreen"); hide("setupScreen"); show("gameScreen");
    addLog(`选秀之日，你以「${escapeHtml(game.family)}」的身份入宫，位列<strong>${escapeHtml(game.rank)}</strong>。红墙之内，从此多了一个名字。`, true);
    addLog("皇后端坐凤位，高位妃嫔协理六宫，妃嫔各怀心思。无人知道，帝王是否曾在人群中多看你一眼。", false);
    renderGame();
  }

  function show(id) { $(id).classList.remove("hidden"); }
  function hide(id) { $(id).classList.add("hidden"); }

  function addLog(text, event = false) {
    game.log.push({ text, event, turn: game.turn, year: game.year, month: game.month });
    if (game.log.length > 70) game.log.shift();
    renderLog();
  }

  function renderLog() {
    $("storyLog").innerHTML = game.log.map((entry) => {
      const safe = escapeHtml(entry.text)
        .replaceAll("&lt;strong&gt;", "<strong>").replaceAll("&lt;/strong&gt;", "</strong>");
      return `<p class="story-entry ${entry.event ? "event" : ""}"><time>${entry.year}年${entry.month}月 · 第${entry.turn}回</time>${safe}</p>`;
    }).join("");
    $("storyLog").scrollTop = $("storyLog").scrollHeight;
  }

  function revealFavor() { game.favorRevealed = true; }

  function gainFavor(baseAmount) {
    const heartMultiplier = 0.5 + game.trueHeart / 100;
    const amount = Math.max(1, Math.round(baseAmount * heartMultiplier));
    game.favor = clamp(game.favor + amount);
    game.playerFavoredThisMonth = true;
    revealFavor();
    return amount;
  }

  function heartChange(kind, amount = 4, major = false, malicious = false) {
    let delta = 0;
    switch (game.emperorType) {
      case "温柔":
        delta = kind === "good" ? rand(0, Math.max(1, Math.floor(amount / 2))) : rand(-Math.ceil(amount / 2), 1);
        game.trueHeart = clamp(game.trueHeart + delta, 0, 91);
        return;
      case "腹黑":
        if (malicious && Math.random() < 0.62) delta = rand(2, amount + 3);
        else if (kind === "good") delta = rand(-1, Math.max(1, Math.floor(amount / 2)));
        else delta = rand(-Math.floor(amount / 2), Math.ceil(amount / 2));
        break;
      case "冷漠":
        if (major) delta = kind === "good" ? rand(2, amount) : rand(-amount, -2);
        else if (Math.random() < 0.08) delta = rand(-2, 2);
        break;
      case "邪恶":
        delta = malicious ? rand(2, amount + 2) : kind === "good" ? rand(-amount, 0) : rand(-2, amount);
        break;
      case "风流":
        delta = rand(-amount, amount + 2);
        break;
      default:
        delta = kind === "good" ? rand(0, amount) : rand(-amount, 1);
    }
    game.trueHeart = clamp(game.trueHeart + delta);
  }

  function finishAction(text, event = true) {
    game.acted = true;
    addLog(text, event);
    renderGame();
  }

  function showToast(text) {
    const toast = $("toast");
    toast.textContent = text;
    toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("hidden"), 2600);
  }

  function openModal(title, text, choices, eyebrow = "择人而行") {
    $("modalTitle").textContent = title;
    $("modalText").textContent = text;
    $("modalEyebrow").textContent = eyebrow;
    $("modalChoices").innerHTML = choices.map((choice, index) => `
      <button class="choice-btn" data-choice="${index}">${choice.label}
      ${choice.note ? `<small>${choice.note}</small>` : ""}</button>`).join("");
    show("choiceModal");
    $("modalChoices").querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const choice = choices[Number(button.dataset.choice)];
        hide("choiceModal");
        choice.run();
      });
    });
  }

  function changeRelation(person, amount) {
    game.relations[person.id] = clamp((game.relations[person.id] || 0) + amount, -100, 100);
  }

  function relationshipLabel(value) {
    if (value >= 25) return "交好";
    if (value <= -25) return "交恶";
    return "泛泛";
  }

  function relationRender() {
    const friendly = game.court.filter((p) => game.relations[p.id] >= 25);
    const hostile = game.court.filter((p) => game.relations[p.id] <= -25);
    const neutral = game.court.filter((p) => Math.abs(game.relations[p.id]) < 25);
    const group = (label, list, kind) => `<div class="relation-group"><div class="relation-label">${label} · ${list.length}</div>${list.length ? list.map((p) => `
      <span class="relation-chip ${kind}">${escapeHtml(p.name)}${p.authority ? `<small>${escapeHtml(p.role)}</small>` : ""}</span>`).join("") : `<span class="empty-note">暂无</span>`}</div>`;
    $("relationsList").innerHTML = group("交好", friendly, "") + group("交恶", hostile, "enemy") + group("中立", neutral, "neutral");
  }

  function offspringRender() {
    const records = [];
    if (game.pregnancy) records.push(`<div class="pregnancy-status">你正在养胎：${game.pregnancy.months} 个月后临盆。孕期健康：${game.stats.health}/100。</div>`);
    game.children.forEach((child) => records.push(`<div class="offspring-item"><b>${escapeHtml(child.name)}</b> · ${child.gender}<small>性格：${child.temperament} · 你的孩子</small></div>`));
    game.court.forEach((person) => {
      if (person.pregnancy) records.push(`<div class="pregnancy-status">${escapeHtml(person.name)}有孕，约${person.pregnancy.months}个月后临盆。</div>`);
      person.children.forEach((child) => records.push(`<div class="offspring-item"><b>${escapeHtml(child.name)}</b> · ${child.gender}<small>性格：${child.temperament} · ${escapeHtml(person.name)}之子</small></div>`));
    });
    $("offspringCount").textContent = game.children.length;
    $("offspringList").innerHTML = records.length ? records.join("") : `<p class="empty-note">尚无子嗣消息</p>`;
  }

  function renderGame() {
    if (!game) return;
    $("turnLabel").textContent = game.turn;
    $("dateLabel").textContent = `贞观${game.year}年${["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"][game.month - 1]}月 · 第${game.monthTurn}回`;
    $("saveStatus").textContent = game.ended ? "命簿已终" : game.acted ? "待翻牌" : "待择行止";
    $("storyDate").textContent = `贞观${game.year}年 · ${game.month}月 · 本月第${game.monthTurn}/3回`;
    $("profileName").textContent = game.name;
    $("profileRank").textContent = game.rank;
    $("profileFamily").textContent = game.family;
    $("favorMeter").style.width = game.favorRevealed ? `${game.favor}%` : "0%";
    $("favorText").textContent = !game.favorRevealed ? "未可知" : game.favor > 75 ? "甚隆" : game.favor > 50 ? "尚可" : game.favor > 25 ? "平平" : "微薄";
    $("prestigeValue").textContent = game.prestige;
    $("reputationValue").textContent = game.reputation;
    $("ageValue").textContent = `${game.age}岁`;
    $("lifeValue").textContent = game.lifeRevealed ? `${Math.floor(game.remainingLifeMonths / 12)}年${game.remainingLifeMonths % 12}月` : "未卜";
    $("lifeValue").classList.toggle("life-known", game.lifeRevealed);

    $("liveStats").innerHTML = Object.entries(game.stats).map(([key, value]) => `
      <div class="live-stat"><span>${statNames[key]}</span><div class="bar"><i style="width:${value}%"></i></div><b>${key === "fertility" ? `${value}%` : value}</b></div>`).join("");
    $("liveSkills").innerHTML = Object.entries(game.skills).map(([name, value]) => `
      <div class="skill-live"><span>${name}</span><b>${value.toFixed(1)}</b></div>`).join("");
    relationRender();
    offspringRender();
    $("rumorLog").innerHTML = game.rumors.length ? game.rumors.slice(-7).reverse().map((rumor) => `<div class="rumor-item">${escapeHtml(rumor)}</div>`).join("") : `<p class="empty-note">尚无新传闻</p>`;
    $("courtCount").textContent = game.court.length + 1;
    $("courtList").innerHTML = `<div class="court-person"><span class="mini-portrait">${escapeHtml(game.name.slice(0, 1))}</span><span class="court-info"><b>${escapeHtml(game.name)}</b><small>${escapeHtml(game.rank)} · 你</small></span><span class="court-tag">本人</span></div>` + game.court.map((person) => `
      <div class="court-person" data-person="${person.id}"><span class="mini-portrait" style="background:${person.color}">${escapeHtml(person.name.slice(0, 1))}</span>
      <span class="court-info"><b>${escapeHtml(person.name)}</b><small>${escapeHtml(person.rank)}${person.pregnancy ? " · 有孕" : ""}</small></span>
      <span class="court-tag ${person.authority ? "authority" : ""}">${person.authority ? escapeHtml(person.role) : "妃嫔"}</span></div>`).join("");
    $("objectiveText").textContent = game.ended ? "此生故事已落幕。" : game.children.length ? `你已育有${game.children.length}名子嗣，且仍可在宫中争取更高位分。` : "积累威望、名声与人脉，在深宫中寻得立足之地。";
    $("nextTurn").disabled = !game.acted || game.ended;
    $("nextTurn").innerHTML = game.monthTurn === 3 ? `翻牌 · 入新月 <span>→</span>` : `翻牌入夜 <span>→</span>`;
    $("turnHint").textContent = game.ended ? "本局已结束，可以重新开启命簿。" : game.acted ? "本回合行止已定；翻牌后，陛下将决定今夜召幸何人。" : "每回合选择一项行动；行动后翻牌，三回合为一月。";
    document.querySelectorAll(".action-card").forEach((button) => { button.disabled = game.acted || game.ended; });
  }

  function actionAttend() {
    openModal("今夜赴宴，你要如何应对？", "御前设宴，众人皆在。你打算以何种方式留下印象？", [
      { label: "以舞助兴", note: `舞蹈 ${game.skills["舞蹈"].toFixed(1)} · 容貌 ${game.stats.beauty}`, run: () => {
        const gain = rand(1, 3) + Math.floor(game.stats.beauty / 40) + Math.floor(game.skills["舞蹈"] / 4);
        gainFavor(gain);
        game.prestige = clamp(game.prestige + rand(2, 5)); game.reputation = clamp(game.reputation + rand(1, 4));
        heartChange("good", 7); finishAction("你于席间翩然起舞，衣袂生风。帝王的目光在你身上停留片刻，席间也有人称赏。看来，陛下对你颇有好感。回宫后，你的威望与名声皆有增长。", true);
      } },
      { label: "以诗应景", note: `聪慧 ${game.stats.wit} · 诗书 ${game.skills["诗书"].toFixed(1)}`, run: () => {
        const gain = rand(1, 4) + Math.floor(game.stats.wit / 40) + Math.floor(game.skills["诗书"] / 4);
        gainFavor(gain); game.prestige = clamp(game.prestige + rand(3, 6));
        game.reputation = clamp(game.reputation + rand(2, 5)); heartChange("good", 8);
        finishAction("你援笔成诗，清雅不俗。席间有人称赏，皇后亦向你微微颔首。你的才名渐渐传开。", true);
      } },
      { label: "从容侍奉", note: `气质 ${game.stats.grace} · 交际 ${game.stats.social}`, run: () => {
        gainFavor(rand(1, 3) + Math.floor(game.stats.grace / 40));
        game.reputation = clamp(game.reputation + rand(2, 4)); heartChange("good", 5);
        finishAction("你不争不抢，只在恰当时候奉上一盏新茶。帝王称你知礼，记下了你的名字。", true);
      } }
    ], "御前宴席");
  }

  function actionStudy() {
    openModal("你想习哪一门技艺？", `静心练习一回合，基础提升0.3；天资越高，技艺提升越快。你的天资暂不显示。`, skillNames.map((skill) => ({
      label: `练习${skill}`, note: `目前 ${game.skills[skill].toFixed(1)} / 10`, run: () => {
        const improvement = Math.round((0.3 + game.talent * 0.003) * 10) / 10;
        game.skills[skill] = Math.min(10, Math.round((game.skills[skill] + improvement) * 10) / 10);
        game.prestige = clamp(game.prestige + 1); game.stats.wit = clamp(game.stats.wit + 1);
        finishAction(`你闭门研习${skill}，本次提升${improvement.toFixed(1)}，技艺达到${game.skills[skill].toFixed(1)}。勤学之名，也为你添了一分威望。`);
      }
    })), "闺中习艺");
  }

  function actionSocial() {
    const targets = game.court.filter(p => !p.dead&&!p.banished);
    openModal("你想与谁结交？", `名声 ${game.reputation}，交际 ${game.stats.social}。名声越高，示好越容易得到回应。`, targets.map((person) => {
      const relation = game.relations[person.id] || 0;
      const relationship = relationshipLabel(relation);
      const invitation = {
        label: `向${person.name}示好`, note: `${relationship} · ${person.role} · 关系 ${relation}`,
        run: () => {
          const chance = clamp(15 + game.stats.social * 0.28 + game.reputation * 0.42 + game.prestige * 0.12 + relation * 0.16, 8, 94);
          if (rand(1, 100) <= chance) {
            const gain = rand(14, 23) + Math.floor(game.reputation / 30);
            changeRelation(person, gain); game.reputation = clamp(game.reputation + rand(1, 3));
            finishAction(`你备了合宜的礼物拜访${person.name}。她接受你的心意，往后若能维持往来，或可成为助力。`);
          } else {
            changeRelation(person, rand(2, 7)); game.reputation = clamp(game.reputation - 1);
            finishAction(`你带着诚意拜访${person.name}，她却只以客套话打发。此番往来没有建立交情，宫人也觉得你尚需磨练。`);
          }
        }
      };
      const reconcile = relation < 0 ? [{ label: `向${person.name}示弱和解`, note: "付出一回合，减轻交恶", run: () => {
        const chance = clamp(25 + game.stats.social * 0.25 + game.reputation * 0.35, 10, 82);
        if (rand(1, 100) < chance) { changeRelation(person, rand(15, 28)); game.reputation = clamp(game.reputation + 2); finishAction(`你放下身段向${person.name}致歉。她未必全然释怀，但两人的嫌隙总算淡了一些。`); }
        else { changeRelation(person, rand(2, 8)); finishAction(`${person.name}没有接受你的和解之意。你在众人面前碰了软钉子，名声略受影响。`); }
      } }] : [];
      const cold = [{ label: `冷落${person.name}`, note: "关系下降；若对方掌权，日后可能报复", run: () => {
        changeRelation(person, -rand(16, 25)); game.prestige = clamp(game.prestige + 1);
        finishAction(`你有意疏远${person.name}。宫中往来本就如履薄冰，你们之间的关系又冷了几分。`);
      } }];
      return { label: `${person.name} · ${relationship}`, note: person.authority ? `${person.role} · 关系 ${relation}` : `关系 ${relation}`, run: () => {
        openModal(`如何与${person.name}往来？`, `${person.name}${person.authority ? `目前${person.role}` : "是六宫妃嫔之一"}。交好掌权者可能助你晋位，交恶则有降位风险。`, [invitation, ...reconcile, ...cold], "六宫往来");
      } };
    }), "人情往来");
  }

  function actionHeir() {
    if (game.pregnancy) { showToast("你正在养胎，暂不宜承宠。"); return; }
    openModal("承宠祈嗣", "若陛下召幸，你便有一线孕育子嗣的机会。孕率、圣眷、健康与帝心都会影响结果。", [
      { label: "祈求陛下召幸", note: `孕率 ${game.stats.fertility}% · 健康 ${game.stats.health}`, run: () => {
        game.requestedIntimacy = true;
        finishAction("你命宫人送去一盏合宜的香汤，悄悄盼望今夜能得召幸。真正的结果，仍要等到翻牌之时。", false);
      } },
      { label: "今日不求子嗣", note: "改日再作打算", run: () => { showToast("你暂且收起了求嗣的念头。"); } }
    ], "子嗣缘分");
  }

  function actionPray() {
    openModal("你要为何事祈福？", "香火渺渺，所求未必得应。偶尔，神明会让你窥见命数的一角。", [
      { label: "为圣眷祈福", note: "可能略增圣眷，也有小概率得知帝心深浅", run: () => {
        if (rand(1, 100) <= 8) addLog(`签文忽然显出一句「情深几许」，你心中一震，似乎窥得陛下真心深浅：${game.trueHeart}/100。这秘密只有你自己知道。`, true);
        else if (rand(1, 100) <= 30) { gainFavor(rand(1, 2)); addLog("你在佛前为圣眷祈福。几日后，御前传来赏赐，像是得了一点回应。", true); }
        else addLog("你为圣眷点了一炷香，香烟散去，心愿仍无人知晓。", true);
        game.prestige = clamp(game.prestige + 1); game.acted = true; renderGame();
      } },
      { label: "为寿数祈福", note: "可能延寿，也有小概率得知剩余寿数", run: () => {
        const insight = rand(1, 100) <= 8;
        if (insight) { game.lifeRevealed = true; addLog(`你抽得一支异常清晰的签，竟窥见自己大约还有${Math.floor(game.remainingLifeMonths / 12)}年${game.remainingLifeMonths % 12}月寿数。命运仍有变数，这只是此刻的征兆。`, true); }
        else if (rand(1, 100) <= 25) { game.remainingLifeMonths += rand(1, 3); addLog("你虔心祈求平安。此后一段时日，你的身体似乎比往常康健。", true); }
        else addLog("你为寿数祈福，只求往后岁月平安。香火渐熄，没有任何异象。", true);
        game.acted = true; renderGame();
      } }
    ], "佛前祈愿");
  }

  function actionRumor() {
    const targets = game.court.filter((person) => !person.empress && !person.dead);
    openModal("流言要传向谁？", "你可借宫人之口散布含糊耳语。威望与聪慧会影响成败；若被追查，名声与圣眷都可能受损。", targets.map((person) => ({
      label: `暗中中伤${person.name}`, note: `${person.role} · 关系 ${game.relations[person.id] || 0}`, run: () => {
        const chance = clamp(22 + game.stats.wit * 0.3 + game.prestige * 0.25 + game.stats.luck * 0.1 - game.reputation * 0.12, 8, 76);
        const malicious = true;
        if (rand(1, 100) <= chance) {
          person.reputation = clamp(person.reputation - rand(8, 17)); changeRelation(person, -rand(5, 12));
          game.prestige = clamp(game.prestige + rand(1, 3)); heartChange("bad", 6, false, malicious);
          game.rumors.push(`宫中传出${person.name}失仪的耳语。`);
          finishAction(`你借着宫人之口放出几句模糊话语。${person.name}的名声果然受了影响；陛下似乎对这场暗流另有看法。`);
        } else {
          game.reputation = clamp(game.reputation - rand(6, 13)); game.favor = clamp(game.favor - rand(3, 9));
          heartChange("bad", 7, true, malicious); game.rumors.push("流言尚未传远，源头便被人追查。 ");
          finishAction(`流言尚未传远，便被人追查源头。虽无实证，你仍受了些责罚，名声与圣眷都淡了几分。`);
        }
      }
    })), "暗流浮动");
  }

  function actionPoison() {
    const targets = game.court.filter((person) => !person.empress && !person.dead);
    openModal("暗中设局，风险极高", "这是架空宫廷故事中的抽象事件判定，不涉及现实方法。若败露，可能失宠、损名，甚至被掌权者降位。", targets.map((person) => ({
      label: `设局陷害${person.name}`, note: `${person.authority ? `${person.role} · ` : ""}关系 ${game.relations[person.id] || 0}`, run: () => {
        const chance = clamp(18 + game.stats.wit * 0.22 + game.stats.luck * 0.18 + game.skills["医学"] * 1.5 + game.prestige * 0.1, 7, 62);
        if (rand(1, 100) <= chance) {
          person.health = clamp(person.health - rand(14, 28)); person.reputation = clamp(person.reputation - rand(7, 15));
          changeRelation(person, -rand(8, 16)); game.prestige = clamp(game.prestige + rand(1, 4));
          heartChange("bad", 9, false, true); game.rumors.push(`${person.name}近日闭门不出，宫中议论纷纷。`);
          finishAction(`几日后，${person.name}忽然称病闭门。此事尚无人查到你头上；陛下似乎对这场暗流另有看法。`);
        } else {
          game.favor = clamp(game.favor - rand(8, 20)); game.reputation = clamp(game.reputation - rand(9, 18));
          heartChange("bad", 12, true, true); game.rumors.push("内廷近日加紧查问，众人皆自危。 ");
          finishAction(`你的安排露出破绽，内廷传召问话。你受了责罚，圣眷与名声都受损。`);
        }
      }
    })), "禁中险局");
  }

  function actionRest() {
    const recovery = rand(9, 18);
    game.stats.health = clamp(game.stats.health + recovery);
    game.reputation = clamp(game.reputation + 1);
    finishAction(`你告病闭门，静养一回合。气色好了些，健康恢复${recovery}点。`);
  }

  function act(kind) {
    if (!game || game.acted || game.ended) return;
    switch (kind) {
      case "attend": actionAttend(); break;
      case "study": actionStudy(); break;
      case "social": actionSocial(); break;
      case "heir": actionHeir(); break;
      case "pray": actionPray(); break;
      case "rumor": actionRumor(); break;
      case "poison": actionPoison(); break;
      case "rest": actionRest(); break;
    }
  }

  function chanceToConceive(person) {
    if (person.pregnancy) return false;
    const isPlayer = person === game;
    const fertility = isPlayer ? game.stats.fertility : person.fertility;
    const health = isPlayer ? game.stats.health : person.health;
    const favor = isPlayer ? game.favor : person.favor;
    const heart = isPlayer ? game.trueHeart : 50;
    const chance = clamp(Math.round(fertility * 0.34 + favor * 0.2 + health * 0.16 + heart * 0.1), 3, 76);
    if (rand(1, 100) > chance) return false;
    person.pregnancy = { months: 9 };
    return true;
  }

  function flipWeights() {
    const candidates = [game, ...game.court].filter((person) => !person.pregnancy);
    const type = game.emperorType;
    if (type === "冷漠" && rand(1, 100) <= 46) return null;
    if (type === "邪恶" && rand(1, 100) <= 18) return null;
    const weights = candidates.map((person) => {
      const isPlayer = person === game;
      const favor = isPlayer ? game.favor : person.favor;
      const base = type === "温柔" ? 55 : type === "冷漠" ? 12 : type === "风流" ? rand(18, 70) : 10;
      const favorite = type === "温柔" ? 0.12 : type === "腹黑" ? 0.22 : type === "冷漠" ? 0.25 : type === "邪恶" ? 0.3 : 0.36;
      const heartBonus = isPlayer ? game.trueHeart * (type === "温柔" ? 0.02 : type === "冷漠" ? 0.08 : 0.2) : 0;
      const requestBonus = isPlayer && game.requestedIntimacy ? 28 : 0;
      return Math.max(1, base + favor * favorite + heartBonus + requestBonus);
    });
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return candidates[i];
    }
    return candidates[candidates.length - 1] || null;
  }

  function resolveFlip() {
    const chosen = flipWeights();
    if (!chosen) {
      game.requestedIntimacy = false;
      addLog("夜深，陛下未翻任何人的牌。宫灯依次熄去，六宫各自安歇。", true);
      heartChange("bad", 3);
      return;
    }
    if (chosen === game) {
      gainFavor(rand(1, 3));
      heartChange("good", 7);
      addLog(`今夜，陛下翻了你的牌。你获得召幸，圣眷增加。帝王离去时神色难辨，真心仍不可测。`, true);
      game.prestige = clamp(game.prestige + rand(1, 3));
      if (game.requestedIntimacy || rand(1, 100) <= 38) {
        if (chanceToConceive(game)) addLog("数日后，太医诊出喜脉。你有孕的消息很快传遍六宫。", true);
        else if (game.requestedIntimacy) addLog("你满心期待，却未能有孕。太医只道缘分未至。", false);
      }
    } else {
      chosen.favor = clamp(chosen.favor + rand(4, 11));
      addLog(`今夜陛下翻了${chosen.name}的牌。她承宠的消息传入各宫，你也感到六宫局势有了微妙变化。`, true);
      if (chanceToConceive(chosen)) addLog(`太医诊出${chosen.name}有孕。宫中又将添一位皇嗣，${chosen.name}的地位随之上升。`, true);
    }
    game.requestedIntimacy = false;
  }

  function resolvePregnancyMonth(person, isPlayer) {
    if (!person.pregnancy) return;
    const health = isPlayer ? game.stats.health : person.health;
    const miscarriageChance = clamp(15 - Math.floor(health * 0.12), 3, 14);
    if (rand(1, 100) <= miscarriageChance) {
      person.pregnancy = null;
      if (isPlayer) {
        game.stats.health = clamp(game.stats.health - rand(8, 18)); game.reputation = clamp(game.reputation - 1);
        addLog("太医诊出胎象不稳，数日后孩子未能保住。你大病一场，需静养调息。", true);
      } else {
        person.health = clamp(person.health - rand(5, 12));
        addLog(`${person.name}的胎象忽然不稳，最终未能保住孩子。消息令六宫一时沉默。`, true);
      }
      return;
    }
    person.pregnancy.months -= 1;
    if (person.pregnancy.months > 0) {
      if (isPlayer) addLog(`太医为你请脉，胎象尚稳。离临盆还有${person.pregnancy.months}个月。`, true);
      return;
    }
    person.pregnancy = null;
    const gender = Math.random() < 0.52 ? "皇子" : "公主";
    const name = pick(gender === "皇子" ? childNames.boy : childNames.girl);
    const child = { name, gender, temperament: pick(childTraits), year: game.year, month: game.month };
    if (isPlayer) {
      game.children.push(child); game.stats.health = clamp(game.stats.health - rand(5, 14));
      gainFavor(rand(3, 5)); game.prestige = clamp(game.prestige + rand(5, 10));
      addLog(`十月怀胎，一朝分娩。你平安诞下${gender}「${name}」，性情${child.temperament}。宫中上下前来道贺，你的地位也更稳固了。`, true);
    } else {
      person.children.push(child); person.health = clamp(person.health - rand(3, 10));
      person.prestige = clamp(person.prestige + rand(5, 10));
      addLog(`${person.name}平安诞下${gender}「${name}」，性情${child.temperament}。六宫纷纷遣人道贺。`, true);
    }
  }

  function finishPlot(text) {
    addLog(text, true);
    renderGame();
  }

  function triggerStoryPlot() {
    const empress = game.court.find((person) => person.empress);
    const authority = game.court.find((person) => person.authority && !person.empress) || empress;
    const rival = pick(game.court.filter((person) => !person.empress && !person.dead));
    const stories = [
      {
        id: "garden-rescue", title: "御花园惊变", text: "你经过太液池时，听见宫女落水呼救。岸边的妃嫔都在观望，谁也不愿先惹麻烦。",
        choices: [
          { label: "立刻命人救她", note: "可能受寒，但善行也许传到御前", run: () => { game.stats.health = clamp(game.stats.health - rand(1, 4)); game.reputation = clamp(game.reputation + rand(3, 6)); game.prestige = clamp(game.prestige + 3); gainFavor(1); heartChange("good", 5); finishPlot("宫女被救上岸。你虽受了些风寒，善行却传到了御前，内廷都夸你仁厚。"); } },
          { label: "先唤侍卫，不亲自下水", note: "稳妥行事，不损健康", run: () => { game.reputation = clamp(game.reputation + 2); finishPlot("你立即唤来巡守侍卫。宫女平安获救，众人称赞你处置得当。"); } }
        ]
      },
      {
        id: "empress-audit", title: "中宫问账", text: "皇后召你协助核对宫中冬衣账册。几处数目对不上，若查得太深，可能得罪经手的内侍。",
        choices: [
          { label: "逐项核查，照实禀报", note: "积累威望，也可能引来不满", run: () => { game.prestige = clamp(game.prestige + 5); game.reputation = clamp(game.reputation + 3); changeRelation(empress, 12); heartChange("good", 4, true); finishPlot("你仔细核对账册，找出一处重复支领。皇后认可你的谨慎，命人按规矩补齐记录。"); } },
          { label: "只指出明显错漏，留些余地", note: "关系更稳，收获较少", run: () => { changeRelation(empress, 16); game.reputation = clamp(game.reputation + 1); finishPlot("你只指出最明显的错漏，没有追问经手人的动机。皇后觉得你知分寸，对你多了几分信任。"); } }
        ]
      },
      {
        id: "birthday-banquet", title: "妃嫔生辰宴", text: `${rival.name}设下小宴，席间礼数周全，笑语之下却各有试探。你要如何回应她递来的酒盏？`,
        choices: [
          { label: "送上一份亲手挑选的贺礼", note: "改善关系，增加名声", run: () => { changeRelation(rival, rand(15, 23)); game.reputation = clamp(game.reputation + 2); game.prestige = clamp(game.prestige + 1); finishPlot(`你送上贺礼，并当众祝${rival.name}生辰安好。她虽未显露太多情绪，往后对你却客气了几分。`); } },
          { label: "礼到人不久留", note: "不主动结交，也不失礼", run: () => { game.reputation = clamp(game.reputation + 1); finishPlot(`你按礼送了贺礼，很快便告辞离席。宴上没有生出波澜，你也没有卷入席间的暗语。`); } }
        ]
      },
      {
        id: "family-letter", title: "迟来的家书", text: "宫门外送来的家书迟迟没有转到你手中。掌事宫人暗示，或许有人以查验为名扣下了信。",
        choices: [
          { label: "请皇后帮忙查问", note: "若交情尚可，可能更有效", run: () => { changeRelation(empress, 10); game.reputation = clamp(game.reputation + 2); const success = rand(1, 100) <= 35 + (game.relations[empress.id] || 0) * 0.35; if (success) { game.prestige = clamp(game.prestige + 2); finishPlot("皇后命人查问后，家书终于送到你手中。信上只写家中安好，却足以让你宽心许久。"); } else finishPlot("皇后答应替你查问，但内廷事务繁杂，家书仍需再等些时日。"); } },
          { label: "托熟识宫人私下打听", note: "交际高、名声好时更容易成功", run: () => { const chance = clamp(game.stats.social * 0.35 + game.reputation * 0.4, 10, 80); if (rand(1, 100) <= chance) { game.reputation = clamp(game.reputation + 2); finishPlot("你托人打听，终于知道家书只是耽搁在宫门查验处。几日后，信平安送入宫中。"); } else { game.reputation = clamp(game.reputation - 3); game.rumors.push("有人私下打听宫门文书的去向。"); finishPlot("私下打听的举动引来管事内侍注意。家书仍未到，你也只得暂时收手。"); } } }
        ]
      },
      {
        id: "jade-pendant", title: "御前玉佩失窃", text: "御前一枚旧玉佩不见了踪影，偏偏昨夜你宫中的侍女曾到过附近。内侍来问话时，神色颇为严厉。",
        choices: [
          { label: "主动交代侍女行踪，协助查找", note: "坦诚有助于保全名声", run: () => { game.reputation = clamp(game.reputation + 4); game.prestige = clamp(game.prestige + 2); heartChange("good", 6, true); finishPlot("你如实说明侍女的行踪，也请她配合查问。玉佩最终在值房找到，陛下称你处事坦荡。"); } },
          { label: "请皇后主持查验，避免私下定罪", note: "增强与中宫的信任", run: () => { changeRelation(empress, 13); game.reputation = clamp(game.reputation + 1); finishPlot("你请求皇后按宫规查验，不愿让侍女私下受屈。皇后命人彻查，避免了一场无端责罚。"); } }
        ]
      },
      {
        id: "winter-medicine", title: "冬夜求药", text: `${rival.name}忽然病倒，太医所需的一味药材暂时短缺。你的宫中恰好还存有一些。`,
        choices: [
          { label: "送出药材，并请太医一并诊治", note: "可能改善关系，也会消耗你的储备", run: () => { changeRelation(rival, rand(12, 20)); game.reputation = clamp(game.reputation + 3); game.stats.health = clamp(game.stats.health + 1); heartChange("good", 7); finishPlot(`你把药材送给${rival.name}，并请太医一同诊治。她病情渐稳，对你的态度也有所缓和。`); } },
          { label: "让她按宫规向内廷申请", note: "不伤和气，也不主动承担", run: () => { game.prestige = clamp(game.prestige + 1); finishPlot(`你没有擅自动用药材，而是提醒她按宫规申请。内廷很快补上药材，你们之间仍保持着距离。`); } }
        ]
      },
      {
        id: "lantern-festival", title: "上元灯会", text: "上元夜宫中设宴赏灯，陛下命妃嫔各献一艺。你有机会在众人面前留下印象。",
        choices: [
          { label: "诵一首新作", note: `诗书 ${game.skills["诗书"].toFixed(1)} · 聪慧 ${game.stats.wit}`, run: () => { const merit = game.skills["诗书"] + game.stats.wit / 40; game.prestige = clamp(game.prestige + Math.max(1, Math.round(merit / 3))); game.reputation = clamp(game.reputation + 2); if (merit > 7) gainFavor(2); heartChange("good", 5); finishPlot(skillReaction("诗书","上元献诗")); } },
          { label: "以乐曲应景", note: `乐曲 ${game.skills["乐曲"].toFixed(1)}`, run: () => { game.prestige = clamp(game.prestige + 2); if (game.skills["乐曲"] >= 6) gainFavor(2); heartChange("good", 4); finishPlot(skillReaction("乐曲","上元奏曲")); } },
          { label: "称病留在宫中", note: "恢复体力，避开争艳", run: () => { game.stats.health = clamp(game.stats.health + 5); finishPlot("你称身体不适，没有赴宴。远处灯火通明，你在宫中安静休息了一夜。"); } }
        ]
      },
      {
        id: "rumor-reckoning", title: "流言回到耳边", text: "近来宫中有人议论你的圣眷。传言越传越离谱，连中宫都听到了风声。",
        choices: [
          { label: "亲自向皇后解释近日行止", note: "名声高时更容易得到信任", run: () => { const chance = clamp(25 + game.reputation * 0.55 + game.stats.social * 0.15, 10, 90); if (rand(1, 100) <= chance) { changeRelation(empress, 8); game.reputation = clamp(game.reputation + 3); finishPlot("你向皇后说明事实，不推诿也不争辩。流言很快失了凭据，皇后准你回宫。"); } else { game.reputation = clamp(game.reputation - 3); finishPlot("你的解释未能完全打消疑虑。皇后没有重罚，只提醒你谨言慎行。"); } } },
          { label: "不回应，专心做好分内之事", note: "稳住声誉，不扩大争端", run: () => { game.prestige = clamp(game.prestige + 2); heartChange("good", 2); finishPlot("你没有回应流言，只把份内事做得妥帖。几日后，宫人谈起了别的事，风声渐渐淡去。"); } }
        ]
      },
      {
        id: "promotion-rumor", title: "册封前夕", text: `宫中忽然传出将有新一轮晋位的消息。几位妃嫔都在打探皇后的意思，${authority.name}也邀你去她宫中说话。`,
        choices: [
          { label: `拜访${authority.name}，请她指点宫中规矩`, note: "协理六宫者可能成为助力", run: () => { changeRelation(authority, rand(10, 18)); game.reputation = clamp(game.reputation + 1); finishPlot(`${authority.name}没有许下承诺，只提醒你把本分之事做好。她愿意与你多说几句，已是一个好开端。`); } },
          { label: "不打听消息，继续积累威望", note: "保持低调", run: () => { game.prestige = clamp(game.prestige + 3); heartChange("good", 3); finishPlot("你没有四处打听晋位的风声，而是按时向中宫问安。几位宫人觉得你沉得住气。"); } }
        ]
      }
    ];
    if (game.plotSeen.length >= stories.length) game.plotSeen = [];
    const available = stories.filter((story) => !game.plotSeen.includes(story.id));
    const story = pick(available);
    game.plotSeen.push(story.id);
    openModal(story.title, story.text, story.choices, "宫闱剧情");
  }

  function monthlyEvent() {
    const outcome = rand(1, 100);
    if (outcome <= 42) {
      triggerStoryPlot();
    } else if (outcome <= 58) {
      const reward = rand(3, 6); game.prestige = clamp(game.prestige + reward); game.reputation = clamp(game.reputation + rand(2, 5));
      gainFavor(rand(1, 2)); heartChange("good", 8, true);
      addLog("你替病中的宫人求来太医，善行传至御前。陛下赏了你，也记住了你的仁厚。威望与名声都有所增长。", true);
    } else if (outcome <= 74) {
      const enemy = game.court.find((person) => game.relations[person.id] <= -25);
      if (enemy) {
        game.reputation = clamp(game.reputation - rand(4, 9)); game.favor = clamp(game.favor - rand(1, 4));
        heartChange("bad", 8, true); game.rumors.push(`${enemy.name}向皇后告了你一状。`);
        addLog(`${enemy.name}将旧怨带到皇后面前。你受了斥责，名声与圣眷受损；陛下对此事的反应难以揣测。`, true);
      } else {
        game.stats.health = clamp(game.stats.health - rand(2, 7)); game.reputation = clamp(game.reputation - rand(1, 4));
        heartChange("bad", 6, true); addLog("一场风寒令你数日不适，宫中又传出几句闲言。你虽无大碍，仍失了些名声。", true);
      }
    } else {
      addLog("这一月宫中风平浪静。你将心思收回，继续经营自己的日常与人脉。", false);
    }
  }

  function resolveAuthorityRelations() {
    const friends = game.court.filter((p) => p.authority && game.relations[p.id] >= 25);
    const enemies = game.court.filter((p) => p.authority && game.relations[p.id] <= -25);
    const rankIndex = ranks.indexOf(game.rank);
    if (enemies.length && rankIndex > 0) {
      const enemy = pick(enemies);
      const risk = clamp(12 + Math.floor(Math.abs(game.relations[enemy.id]) * 0.28) - Math.floor(game.prestige * 0.12), 5, 48);
      if (rand(1, 100) <= risk) {
        game.rank = ranks[rankIndex - 1]; game.prestige = clamp(game.prestige - rand(3, 8));
        addLog(`${enemy.name}在协理六宫时提起你近日的失仪，皇后未替你说话。你被降为${game.rank}，威望也受打击。`, true);
      }
    } else if (friends.length && rankIndex < ranks.length - 1) {
      const friend = pick(friends);
      const helpChance = clamp(16 + game.prestige * 0.27 + game.reputation * 0.12, 18, 58);
      if (rand(1, 100) <= helpChance) {
        game.rank = ranks[rankIndex + 1]; game.prestige = clamp(game.prestige + rand(4, 8));
        addLog(`${friend.name}在皇后面前替你说了几句公道话。陛下遂下旨晋你为${game.rank}，你的威望也随之提升。`, true);
      }
    }
  }

  function monthlyPromotion() {
    const index = ranks.indexOf(game.rank);
    if (index < ranks.length - 1) {
      const friendBonus = game.court.some((p) => p.authority && game.relations[p.id] >= 25) ? 16 : 0;
      const score = game.prestige * 0.42 + game.favor * 0.19 + game.trueHeart * 0.22 + game.reputation * 0.12 + friendBonus;
      const chance = clamp(Math.round(score - 22), 5, 78);
      if (rand(1, 100) <= chance) {
        game.rank = ranks[index + 1]; game.prestige = clamp(game.prestige + rand(4, 8));
        addLog(`陛下下旨晋你为${game.rank}。威望、圣眷与帝心都在暗中影响这道旨意，六宫一时贺声四起。`, true);
      }
    }
    resolveAuthorityRelations();
  }

  function highHeartJealousy() {
    if (game.trueHeart < 68 || rand(1, 100) > 16 + Math.floor((game.trueHeart - 68) * 1.5)) return;
    const rival = pick(game.court.filter((p) => !p.empress && !p.dead&&!p.banished));
    const loss = rand(3, 9);
    game.reputation = clamp(game.reputation - loss);
    changeRelation(rival, -rand(3, 9));
    game.rumors.push(`你近日屡得召幸，${rival.name}宫中开始传出对你不利的话。`);
    addLog(`你近日屡得召幸，${rival.name}心生嫉意，宫中渐渐传出针对你的流言。真心越深，越容易成为众矢之的。`, true);
  }

  function monthlyTick(endedMonth) {
    resolvePregnancyMonth(game, true);
    game.court.filter(p => !p.dead&&!p.banished).forEach((person) => resolvePregnancyMonth(person, false));
    game.remainingLifeMonths -= 1;
    if (endedMonth === 12) game.age += 1;
    if (!game.playerFavoredThisMonth && rand(1, 100) <= 38) game.favor = clamp(game.favor - 1);
    game.playerFavoredThisMonth = false;
    monthlyEvent();
    highHeartJealousy();
    monthlyPromotion();
    game.court.forEach((person) => {
      person.favor = clamp(person.favor + rand(-4, 4));
      person.health = clamp(person.health + rand(-2, 1));
    });
    if (game.remainingLifeMonths <= 0) {
      game.ended = true;
      addLog(`你走过了${game.age}年岁月，终在一场安睡中离开人世。此生在宫中的故事，就此落下帷幕。`, true);
    }
  }

  function advanceRound() {
    if (!game || !game.acted || game.ended) return;
    resolveFlip();
    if(game.ended){renderGame();saveGame("auto");return;}
    game.turn += 1;
    game.monthTurn += 1;
    if (game.monthTurn > 3) {
      const endedMonth = game.month;
      game.monthTurn = 1;
      game.month += 1;
      if (game.month > 12) { game.month = 1; game.year += 1; }
      monthlyTick(endedMonth);
    }
    game.acted = false;
    renderGame();
  }

  function openCheat() {
    show("cheatBackdrop");
    $("cheatInput").value = "";
    $("cheatReport").classList.add("hidden");
    setTimeout(() => $("cheatInput").focus(), 0);
  }

  function showCheatReport(content) {
    const report = $("cheatReport");
    report.innerHTML = content;
    report.classList.remove("hidden");
  }

  function revealHiddenValues() {
    const court = game.court.map((person) => `${escapeHtml(person.name)}：圣眷${person.favor}、威望${person.prestige}、名声${person.reputation}、孕率${person.fertility}%、健康${person.health}、关系${game.relations[person.id] || 0}`).join("<br>");
    showCheatReport(`<b>隐秘命数已揭开</b><br>天资：${game.talent}/100<br>皇帝真心：${game.trueHeart}/100<br>皇帝性格：${escapeHtml(game.emperorType)}<br>剩余寿命：${Math.floor(game.remainingLifeMonths / 12)}年${game.remainingLifeMonths % 12}月<br>皇帝剩余寿命：${game.emperorLife||0}个月<br>本人圣眷：${game.favor}/100<br>六宫人物：<br>${court}`);
  }

  function applyMaxCheat() {
    Object.keys(game.stats).forEach((key) => { game.stats[key] = 100; });
    Object.keys(game.skills).forEach((key) => { game.skills[key] = 10; });
    game.prestige = 100; game.reputation = 100; game.favor = 100; game.trueHeart = 100; game.talent = 100;
    game.remainingLifeMonths = 1200; if(game.emperorLife)game.emperorLife=1200; game.lifeRevealed = true; game.favorRevealed = true;
    game.rank = ranks[ranks.length - 1]; game.ended = false;
    game.court.forEach((person) => {
      person.favor = 100; person.prestige = 100; person.reputation = 100;
      person.fertility = 100; person.health = 100; game.relations[person.id] = 100;
    });
    renderGame();
    showCheatReport("<b>命数悉数改写</b><br>所有百分制数值、天资、帝心与六宫人物属性均已设为100；技艺为10/10，位分升至贵妃，寿数延至百年。皇帝性格保留原本设定。 ");
  }

  $("cheatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!game) { showCheatReport("请先开始游戏，再输入密令。"); return; }
    const code = $("cheatInput").value.trim().toLowerCase();
    if (code === "ilovebetty") revealHiddenValues();
    else if (code === "bettyispretty") applyMaxCheat();
    else showCheatReport("密令不正确。");
  });
  $("closeCheat").addEventListener("click", () => hide("cheatBackdrop"));
  $("cheatBackdrop").addEventListener("click", (event) => { if (event.target.id === "cheatBackdrop") hide("cheatBackdrop"); });
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && (event.code === "Space" || event.key === " ")) { event.preventDefault(); openCheat(); }
    if (event.key === "Escape") hide("cheatBackdrop");
  });

  // Palace simulation expansion, save schema 4.
  const traits = ['温婉','爽朗','城府深沉','骄矜','谨慎','争强好胜','淡泊','善妒'];
  const reigns = ['景和','承熙','永宁','昭元','天祐','元嘉','建安','隆庆'];
  const poisons = [
    {name:'落红砂',kind:'miscarry',note:'使有孕之人失胎'},
    {name:'蚀玉露',kind:'beauty',note:'损伤容颜，降低承宠机会'},
    {name:'断魂霜',kind:'fatal',note:'可能致命，败露将严惩'}
  ];
  let autoTimer = null;
  function portrait(seed) {
    const hue = (seed * 79) % 360;
    return `<svg viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="随机古风人物立绘"><rect width="180" height="240" fill="hsl(${hue} 20% 88%)"/><circle cx="135" cy="44" r="27" fill="#fbefd3"/><path d="M22 240Q26 155 90 151Q153 157 159 240" fill="hsl(${hue} 34% 38%)"/><path d="M68 155L90 203L112 155M90 203L123 240" fill="none" stroke="#dfbf86" stroke-width="7"/><path d="M57 88Q39 15 91 29Q145 18 126 99L122 159L58 160Z" fill="#292020"/><ellipse cx="90" cy="105" rx="32" ry="43" fill="#f2d4bc"/><path d="M56 83Q79 84 97 54Q111 77 125 82L118 48L68 43Z" fill="#292020"/><path d="M70 104l11 -2m18 0l11 2" stroke="#49302c" stroke-width="2"/><path d="M83 126Q90 131 97 126" fill="none" stroke="#a24c50" stroke-width="2"/><path d="M44 49L137 40" stroke="#c7a65a" stroke-width="3"/><circle cx="133" cy="39" r="7" fill="#a5444c"/><circle cx="48" cy="49" r="5" fill="#d5bd83"/><path d="M128 48v29" stroke="#c7a65a" stroke-width="2"/></svg>`;
  }
  function makeCourtPerson(rank, authority=false, empress=false) {
    const fullName = randomName();
    return {id:`court-${Date.now()}-${rand(1,999999)}`,name:fullName,rank,role:empress?'皇后':authority?'协理六宫':'妃嫔',authority,empress,temperament:pick(traits),favor:rand(10,70),reputation:rand(25,80),prestige:rand(20,70),fertility:rand(0,25),health:rand(60,95),beauty:rand(35,95),pregnancy:null,children:[],color:pick(colors),portraitSeed:rand(1,99999)};
  }
  createCourt = function() {
    return [makeCourtPerson('皇后',true,true),makeCourtPerson('贵妃',true),...Array.from({length:5},()=>makeCourtPerson(pick(['淑妃','德妃','贤妃','昭仪','婕妤','美人','才人'])))];
  };
  const originalSetup = makeSetup;
  makeSetup = function() { const s=originalSetup(); s.stats.fertility=rand(0,25);return s; };
  const originalStart = startGame;
  startGame = function() {
    originalStart();
    game.emperorName='李'+pick(['承','景','弘','昭','元','玄'])+pick(['珩','煜','衡','渊','祐','晟']);
    game.reign=pick(reigns);game.emperorAge=rand(22,45);game.emperorLife=rand(120,480);game.emperorBirthday=rand(1,12);
    game.portraitSeed=rand(1,99999);game.inventory=[];game.emperorAlive=true;
    addLog(`${game.reign}二年，${game.emperorName}在位。陛下现年${game.emperorAge}岁，生辰在${game.emperorBirthday}月。`,true);
    renderGame();saveGame('auto');
  };
  chanceToConceive = function(person) {
    if(person.pregnancy || person.dead || !game.emperorAlive) return false;
    const fertility=clamp(person===game?game.stats.fertility:person.fertility,0,25);
    const health=person===game?game.stats.health:person.health;
    if(Math.random()*100 >= fertility*(0.35+health/200)) return false;
    person.pregnancy={months:9};return true;
  };
  const originalFlipWeights=flipWeights;
  flipWeights=function(){
    const old=game.court;game.court=old.filter(p=>!p.dead&&!p.banished);
    const chosen=originalFlipWeights();game.court=old;return chosen;
  };
  actionStudy=function(){
    openModal('习文修艺','天资影响精进速度，不同技艺也会改变你的资质。',skillNames.map(skill=>({label:`研习${skill}`,note:`当前 ${game.skills[skill].toFixed(1)}/10`,run:()=>{
      const gain=Math.round((0.3+game.talent*0.003)*10)/10;
      game.skills[skill]=Math.min(10,Math.round((game.skills[skill]+gain)*10)/10);
      const stat={'诗书':'wit','舞蹈':'beauty','乐曲':'grace','女红':'social'}[skill];
      if(stat)game.stats[stat]=clamp(game.stats[stat]+1);
      game.prestige=clamp(game.prestige+1);
      finishAction(`你研习${skill}，技艺提升${gain.toFixed(1)}。${stat?statNames[stat]+'也随之提升。':skill==='医学'?'辨毒与施毒之术更精进了。':'你对调香、制毒香与合欢香更有心得。'}`);
    }})));
  };
  function resolvePoison(target,poison,byPlayer=true) {
    const isPlayer=target===game;
    if(poison.kind==='miscarry') {
      if(target.pregnancy){target.pregnancy=null;addLog(`${isPlayer?'你':target.name}中了${poison.name}，不幸失胎。`,true);}
      else {if(isPlayer)game.stats.health=clamp(game.stats.health-8);else target.health=clamp(target.health-8);addLog(`${isPlayer?'你':target.name}服食的饮食中被查出${poison.name}，所幸未曾有孕。`,true);}
    } else if(poison.kind==='beauty') {
      if(isPlayer)game.stats.beauty=clamp(game.stats.beauty-rand(15,30));else target.beauty=clamp(target.beauty-rand(15,30));
      target.favor=clamp(target.favor-rand(8,15));addLog(`${isPlayer?'你':target.name}中了${poison.name}，容颜受损，太医只能缓缓调养。`,true);
    } else {
      const death=rand(1,100)>(isPlayer?game.stats.health:target.health)*0.5+25;
      if(death){if(isPlayer)game.ended=true;else target.dead=true;addLog(`${isPlayer?'你':target.name}中了${poison.name}，终因药石无灵而薨逝。`,true);}
      else {if(isPlayer)game.stats.health=clamp(game.stats.health-40);else target.health=clamp(target.health-40);addLog(`${isPlayer?'你':target.name}险些命丧${poison.name}，虽经太医抢救，仍元气大伤。`,true);}
    }
    if(byPlayer)heartChange('bad',12,true,true);
  }
  actionPoison=function(){
    openModal('暗中施毒','医学提高成功率。下毒可能败露，致死之毒尤其容易引来彻查。',game.court.filter(p=>!p.dead&&!p.banished).map(p=>({label:`对${p.name}设局`,note:`${p.rank} · ${p.temperament}`,run:()=>openModal('选择毒药','以下均为架空剧情道具。',poisons.map(poison=>({label:poison.name,note:poison.note,run:()=>{
      const stock=game.inventory.indexOf(poison.name);if(stock<0)return showToast("药匣中没有此药，请先购买");game.inventory.splice(stock,1);
      const chance=clamp(15+game.skills['医学']*5+game.skills['香料']*2+game.stats.luck*0.1-(poison.kind==='fatal'?15:0),5,85);
      if(rand(1,100)<=chance){resolvePoison(p,poison);changeRelation(p,-30);finishAction(`你将${poison.name}送入暗处，风声暂未传出。`);}
      else {game.favor=clamp(game.favor-15);game.reputation=clamp(game.reputation-20);game.rank=nextRank(game,-1)||game.rank;changeRelation(p,-45);finishAction(`${poison.name}被查获，你受到降位与禁足的惩处。`);}
    }})))})));
  };
  function craftAction(){
    openModal('绣坊与香室','自制物品可用来赠礼，也可能引出特殊剧情。',[
      {label:'绣制云锦香囊',note:'女红达到3级',run:()=>craft('云锦香囊','女红',3)},
      {label:'调制清心兰香',note:'香料达到3级',run:()=>craft('清心兰香','香料',3)},
      {label:'调制合欢夜香',note:'香料达到5级 · 可能引出御前夜话',run:()=>craft('合欢夜香','香料',5)},
      {label:'调制藏毒沉香',note:'香料6级、医学4级 · 高风险',run:()=>{if(game.skills['医学']<4)return showToast('医学须达到4级');craft('藏毒沉香','香料',6);}}
    ]);
  }
  function craft(name,skill,level){if(game.skills[skill]<level)return showToast(`${skill}须达到${level}级`);game.inventory.push(name);finishAction(`你在宫中亲手制成了${name}，可在赠礼时使用。`);}
  function giftAction(){
    if(!game.inventory.length)return showToast('请先在绣坊与香室制作物品');
    openModal('择人赠礼','宫中礼尚往来，手作更显心意。',game.court.filter(p=>!p.dead&&!p.banished).map(p=>({label:`赠予${p.name}`,note:`${p.temperament} · 关系${game.relations[p.id]||0}`,run:()=>openModal('选择礼物','礼物在送出后消耗。',game.inventory.map((item,i)=>({item,i})).filter(({item})=>!poisons.some(p=>p.name===item)).map(({item,i})=>({label:item,run:()=>{
      game.inventory.splice(i,1);
      if(item==='藏毒沉香'){resolvePoison(p,poisons[1]);changeRelation(p,-25);game.reputation=clamp(game.reputation-6);}
      else {changeRelation(p,Math.round(8+game.skills[item==='云锦香囊'?'女红':'香料']*2));game.reputation=clamp(game.reputation+2);}
      finishAction(`你将${item}送给${p.name}，六宫人情又有了新的变化。`);
    }})))})));
  }
  function incenseAction(){
    const i=game.inventory.indexOf('合欢夜香');if(i<0)return showToast('须先调制合欢夜香');
    game.inventory.splice(i,1);
    if(rand(1,100)<=65){gainFavor(2);heartChange('good',8,true);finishAction('合欢夜香袅袅，陛下留步听你说起宫外旧事。香气只是契机，这一夜的交心才让他记住了你。');}
    else {game.reputation=clamp(game.reputation-5);finishAction('陛下不喜浓香，命人撤去香炉。宫中随即传出你以香争宠的议论。');}
  }
  function childAction(){
    const children=[...game.children.filter(c=>!c.dead),...game.court.flatMap(p=>p.children.filter(c=>!c.dead).map(c=>({...c,mother:p.name,guest:true})))];
    if(!children.length)return showToast('宫中尚无子嗣');
    openModal('子嗣养育','乳母照料起居，老师影响学业，陪伴可以增进亲近。',children.map(c=>({label:`${c.gender} · ${c.name}`,note:`${c.temperament} · ${c.guest?'生母 '+c.mother:'亲近 '+(c.bond||0)+' · 学业 '+(c.learning||0)}${c.nurse?' · 乳母 '+c.nurse:''}${c.teacher?' · 先生 '+c.teacher:''}`,run:()=>{
      if(c.guest)return openModal('探望皇嗣',`${c.name}正在宫人照料下玩耍。`,[{label:'赠书问候',run:()=>{game.reputation=clamp(game.reputation+2);finishAction(`你向${c.name}赠书问候，也与其生母拉近了距离。`);}}]);
      openModal('安排起居与教养',`${c.name} · ${c.temperament}`,['聘请乳母','延请老师','一起读书','庭院游玩'].map(action=>({label:action,run:()=>{
        if(action==='聘请乳母')c.nurse=pick(['周嬷嬷','许嬷嬷','林嬷嬷']);
        if(action==='延请老师')c.teacher=pick(['沈学士','顾先生','陆女史']);
        c.bond=clamp((c.bond||0)+rand(5,12));if(action==='一起读书')c.learning=clamp((c.learning||0)+5);
        finishAction(`你为${c.name}${action}。孩子的性情是${c.temperament}，与你也愈发亲近。`);
      }})));
    }})));
  }
  function selection(){
    const fresh=Array.from({length:rand(2,3)},()=>makeCourtPerson(pick(['采女','御女','宝林','才人','美人'])));
    fresh.forEach(p=>{game.court.push(p);game.relations[p.id]=0;});
    addLog(`选秀大典开启，${fresh.map(p=>p.name+'（'+p.rank+'，'+p.temperament+'）').join('、')}入宫。六宫格局自此又添变数。`,true);
  }
  function suggestSelection(){
    if(!(game.prestige>=75&&ranks.indexOf(game.rank)>=15))return showToast('须位列四妃且威望达到75，方可获得协理后宫之权');
    if(game.lastSuggestedYear===game.year)return showToast('本年已建议选秀');
    game.lastSuggestedYear=game.year;selection();finishAction('你以协理后宫的身份建议选秀，陛下准奏。');
  }
  function banquet(birthday){
    openModal(birthday?'万寿盛宴':'岁末年宴',`${birthday?'陛下生辰，':'辞旧迎新，'}席间歌舞正盛，忽有${pick(['舞姬献舞','异国使者携佳人入觐'])}。众妃望向御座，等候圣意。`,[
      {label:'以诗乐献祝',note:'才艺影响圣眷与威望',run:()=>{const good=game.skills['诗书']+game.skills['乐曲']>=10;if(good)gainFavor(2);game.prestige=clamp(game.prestige+(good?5:2));finishPlot(skillReaction(game.skills['诗书']>=game.skills['乐曲']?'诗书':'乐曲','宴席献祝'));saveGame('auto');}},
      {label:'从容接待来客',note:'可能有新人留在宫中',run:()=>{if(rand(1,100)<60){const p=makeCourtPerson('美人');game.court.push(p);game.relations[p.id]=5;addLog(`${p.name}获封美人，性情${p.temperament}，自此留在宫中。`,true);}game.reputation=clamp(game.reputation+3);finishPlot('你按礼接待来客，宴席在觥筹交错间散去。');saveGame('auto');}}
    ],'宫廷盛事');
  }
  function emperorPlot(){
    const scenes={
      '温柔':['御园春雨','陛下将一柄伞递到你手中，又嘱宫人给其余妃嫔也送去。','谢过关怀，替宫人求一碗热汤'],
      '腹黑':['棋局藏锋','陛下摆下一盘残局，笑问你愿否弃一枚棋子换全局。','说出自己的取舍'],
      '冷漠':['旧物无言','你偶然看见陛下独坐灯前，摩挲一枚旧玉。此刻的沉默像是一道门。','不追问，陪他坐到灯尽'],
      '邪恶':['御前试心','陛下命你评断宫人之过，语气含笑，眼中却没有半分温度。','按宫规为宫人争取公允'],
      '风流':['折花赠谁','陛下携新折的花枝而来，问你愿不愿为今夜写一首诗。','接花作诗，留下自己的心意']
    };const s=scenes[game.emperorType];
    openModal(s[0],s[1],[{label:s[2],run:()=>{heartChange('good',10,true);gainFavor(1);finishPlot('这一场相遇被悄悄记入宫中的岁月。帝心的变化，仍只有时间知道。');saveGame('auto');}},{label:'以礼告退',run:()=>{game.reputation=clamp(game.reputation+1);finishPlot('你行礼告退，将未说出口的话留在了灯影里。');saveGame('auto');}}],'帝王心事');
  }
  const originalMonth=monthlyTick;
  monthlyTick=function(endedMonth){
    addLog(`【月序更替】${game.reign}${game.year}年${game.month}月，宫漏又换新声。`,true);
    originalMonth(endedMonth);
    if(game.ended)return;
    game.emperorLife-=1;
    if(endedMonth===12)game.emperorAge++;
    for(const c of game.children){if(c.teacher)c.learning=clamp((c.learning||0)+2);if(c.nurse)c.bond=clamp((c.bond||0)+1);}
    if(game.emperorLife<=0){
      game.emperorAlive=false;game.ended=true;hide('choiceModal');
      const high=ranks.indexOf(game.rank)>=15;const crown=royalSons().find(s=>s.c.id===game.crownPrinceId);const son=crown?(crown.m===game?crown.c:null):game.children.find(c=>c.gender==='皇子'&&!c.dead);
      addLog(`${game.emperorName}驾崩，国丧之钟传遍宫城。${(son&&(high||game.crownMotherId==='player'))?'你的皇子获群臣拥立，你受尊为皇太后，扶幼主治理内廷。':high?'你以先帝高位妃嫔之尊迁居寿安宫，受新朝供养，余生由此翻开另一页。':game.children.length?'你随子嗣移居别宫，守望他们在新朝中成长。':'你以低位宫眷身份奉诏迁往皇家佛寺，青灯古卷成为往后的陪伴。'}【此局终章】`,true);return;
    }
    if(game.year%3===2&&game.month===1)selection();
    if(game.month===game.emperorBirthday)banquet(true);
    else if(game.month===12)banquet(false);
    else if($('choiceModal').classList.contains('hidden')&&rand(1,100)<=30)emperorPlot();
    const enemies=game.court.filter(p=>!p.dead&&!p.banished&&(game.relations[p.id]<-20||p.temperament==='善妒'));
    if(enemies.length&&rand(1,100)<=15){
      const enemy=pick(enemies);const detect=clamp(10+game.skills['医学']*7+game.skills['香料']*1.5,10,95);
      if(rand(1,100)<=detect){addLog(`你凭医理察觉膳食气味异常，查出${enemy.name}送来的食盒藏有毒物，避过一劫。`,true);changeRelation(enemy,-15);}
      else resolvePoison(game,pick(poisons),false);
    }
  };
  function saveGame(slot='manual'){
    if(!game)return;
    try{localStorage.setItem('palace-v4-'+slot,JSON.stringify({schema:4,savedAt:new Date().toISOString(),game}));if(slot==='manual')showToast('存档成功');}
    catch{showToast('浏览器未允许保存，请导出存档备份');}
  }
  function restore(data){
    if(data.schema!==4||!data.game||!Array.isArray(data.game.court)||!data.game.stats)throw new Error('无效存档');
    clearTimeout(autoTimer);game=data.game;hide('introScreen');hide('setupScreen');show('gameScreen');hide('choiceModal');
    $('welcomeTitle').textContent=game.name+'的深宫命簿';renderGame();showToast('已读取存档');
  }
  function loadGame(slot='manual'){try{const raw=localStorage.getItem('palace-v4-'+slot);if(!raw)return showToast('此存档位尚无记录');restore(JSON.parse(raw));}catch{showToast('存档无法读取');}}
  function saveMenu(){openModal('命簿存档','存档保存在当前浏览器。导出文件可用于更换设备；自动存档在回合结束时更新。',[
    {label:'手动存档',run:()=>saveGame()}, {label:'读取手动存档',run:()=>loadGame()}, {label:'读取自动存档',run:()=>loadGame('auto')},
    {label:'导出存档',run:()=>{if(!game)return;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({schema:4,game})],{type:'application/json'}));a.download='宫闱命簿.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}},
    {label:'导入存档',run:()=>{const input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=async()=>{try{restore(JSON.parse(await input.files[0].text()));}catch{showToast('无效存档文件');}};input.click();}}
  ]);}
  const originalRender=renderGame;
  renderGame=function(){
    originalRender();if(!game)return;
    $('dateLabel').textContent=`${game.reign||'景和'}${game.year}年${game.month}月 · 第${game.monthTurn}回`;
    $('storyDate').textContent=`${game.emperorName||'陛下'} · ${game.reign||'景和'}${game.year}年${game.month}月`;
    $('nextTurn').classList.add('hidden');$('turnHint').textContent='行动后自动翻牌入夜，三回合为一月；每回合自动存档。';
    document.querySelector('.portrait').innerHTML=characterPortrait(game);
    $('courtList').innerHTML=game.court.map(p=>`<div class="court-person" data-person="${p.id}"><div class="mini-portrait">${characterPortrait(p)}</div><div><b>${escapeHtml(p.name)}</b><small>${p.dead?'已薨':escapeHtml(p.rank)} · ${p.temperament||'谨慎'}${p.authority?' · '+p.role:''}</small></div></div>`).join('');
    document.querySelectorAll('.story-entry').forEach(el=>{if(el.textContent.includes('【月序更替】'))el.classList.add('month-entry');});
    if(game.acted&&!game.ended&&!autoTimer){autoTimer=setTimeout(()=>{autoTimer=null;advanceRound();saveGame('auto');},500);}
  };
  const originalFinishPlot=finishPlot;
  finishPlot=function(text){originalFinishPlot(text);saveGame('auto');};
  const originalAct=act;
  act=function(kind){if(!game||game.acted||game.ended)return;const extra={craft:craftAction,gift:giftAction,incense:incenseAction,children:childAction,selection:suggestSelection};if(extra[kind])extra[kind]();else originalAct(kind);};
  const actions=document.querySelector('.action-grid');
  [['craft','绣坊香室','制作刺绣与香品'],['gift','亲手赠礼','以手作结交六宫'],['incense','御前用香','合欢香引出夜话'],['children','教养子嗣','乳母、老师与陪伴'],['selection','建议选秀','高位协理者可奏请']].forEach(([key,title,note])=>{const b=document.createElement('button');b.className='action-card';b.innerHTML=`<b>${title}</b><small>${note}</small>`;b.onclick=()=>act(key);actions.append(b);});
  const saveButton=document.createElement('button');saveButton.className='subtle-btn';saveButton.textContent='存档 / 读档';saveButton.onclick=()=>{show('gameScreen');saveMenu();};document.querySelector('.topbar').append(saveButton);

  const rankGroups=[['采女'],['御女'],['宝林'],['才人'],['美人'],['婕妤'],['充媛','充容','充仪','修媛','修容','修仪','昭媛','昭容','昭仪'],['贤妃','德妃','淑妃'],['贵妃']];
  const rankLimit=(rank)=>rank==='皇后'||rankGroups.slice(6).flat().includes(rank)?1:rank==='婕妤'?9:rank==='美人'?12:Infinity;
  const rankTier=(rank)=>rank==='皇后'?9:rankGroups.findIndex(g=>g.includes(rank));
  function rankCount(rank,exclude=null){return [game,...game.court].filter(p=>p!==exclude&&!p.dead&&!p.banished&&p.rank===rank).length;}
  function vacant(rank,exclude=null){return rankCount(rank,exclude)<rankLimit(rank);}
  function nextRank(person,direction=1){
    for(let i=rankTier(person.rank)+direction;i>=0&&i<rankGroups.length;i+=direction){
      const free=rankGroups[i].filter(r=>vacant(r,person));
      if(free.length)return pick(free);
      // A full tier blocks promotion; demotion may continue downwards.
      if(direction>0)return null;
    }return null;
  }
  function normalizeRanks(){
    const counts={};
    for(const p of [...game.court,game]){
      if(p.dead||p.banished)continue;
      let tier=rankTier(p.rank);
      while((counts[p.rank]||0)>=rankLimit(p.rank)&&tier>0){
        const alternative=rankGroups[tier]?.find(r=>(counts[r]||0)<rankLimit(r));
        if(alternative){p.rank=alternative;break;}
        tier--;p.rank=rankGroups[tier][0];
      }
      counts[p.rank]=(counts[p.rank]||0)+1;
    }
  }
  resolveAuthorityRelations=function(){};
  monthlyPromotion=function(){
    const authorities=game.court.filter(p=>!p.dead&&!p.banished&&p.authority);
    const enemy=authorities.find(p=>game.relations[p.id]<=-25);
    if(enemy&&rand(1,100)<=clamp(10+Math.abs(game.relations[enemy.id])*.2-game.prestige*.1,3,35)){
      const lower=nextRank(game,-1);if(lower){game.rank=lower;game.prestige=clamp(game.prestige-5);addLog(`${enemy.name}在御前弹劾你的失仪，你被降为${lower}。`,true);}return;
    }
    const support=authorities.some(p=>game.relations[p.id]>=25)?12:0;
    const chance=clamp(game.prestige*.32+game.favor*.16+game.trueHeart*.15+support-20,2,50);
    if(rand(1,100)<=chance){const higher=nextRank(game);if(higher){game.rank=higher;game.prestige=clamp(game.prestige+4);addLog(`册封诏下，你晋为${higher}。此次按品阶晋升，同品九嫔与三妃之间不作逐级迁转。`,true);}else if(rankTier(game.rank)<8)addLog('你已有晋位之望，但上一级名额已满，册封暂缓。',true);}
    const npc=pick(game.court.filter(p=>!p.dead&&!p.banished&&!p.empress));
    if(npc&&rand(1,100)<12){const higher=nextRank(npc);if(higher){npc.rank=higher;addLog(`${npc.name}获晋${higher}，内廷重新核定其月例。`,true);}}
  };
  const goods=[
    {name:'海棠金步摇',tag:'珠玉',price:3200},{name:'凝翠白玉佩',tag:'珠玉',price:2400},
    {name:'松风澄心笺',tag:'诗书',price:800},{name:'兰亭摹本',tag:'诗书',price:1800},
    {name:'雨过天青盏',tag:'茶器',price:1600},{name:'云岫春芽',tag:'茶器',price:600},
    {name:'月下沉水香',tag:'香品',price:2200},{name:'雪蕊凝露香',tag:'香品',price:1100},
    {name:'流霞织锦',tag:'刺绣',price:1400},{name:'双燕绣屏',tag:'刺绣',price:2000},
    {name:'凤鸣玉笛',tag:'乐器',price:2800},{name:'秋水琴谱',tag:'乐器',price:1000},
    {name:'桂露酥酪',tag:'点心',price:400},{name:'杏花蜜饯',tag:'点心',price:250}
  ];
  const factions=['凤仪一脉','兰台清流','绮罗同盟','独善其身'];
  const preferences=['珠玉','诗书','茶器','香品','刺绣','乐器','点心'];
  function addCharacterDetails(p){p.faction ||= p.empress?factions[0]:pick(factions);p.preference ||= pick(preferences);p.dislike ||= pick(preferences.filter(t=>t!==p.preference));p.children ||= [];}
  function salary(rank=game.rank){return [1350,1750,2000,3000,3500,5000,6000,8000,8000,10000][rankTier(rank)]||1350;}
  function initializeWorld(){
    game.money ??= salary()*2;game.faction ||= '独善其身';game.childSerial ??= 1;
    game.court.forEach(addCharacterDetails);normalizeRanks();
    for(const p of [game,...game.court])for(const c of p.children){c.id ||= `child-${game.childSerial++}`;c.ageMonths ??= Math.max(0,(game.year-c.year)*12+game.month-c.month);c.health ??=rand(65,100);c.bond ??=0;c.learning ??=0;}
  }
  const v4Start=startGame;
  startGame=function(){
    v4Start();initializeWorld();
    if(rand(1,100)<=70){
      const count=rand(1,4);for(let i=0;i<count;i++){
        const mother=pick(game.court.filter(p=>!p.dead&&!p.banished));const gender=pick(['皇子','公主']);const ageMonths=rand(3,Math.min(144,(game.emperorAge-18)*12));
        const c={id:`child-${game.childSerial++}`,name:pick(gender==='皇子'?childNames.boy:childNames.girl),gender,temperament:pick(childTraits),ageMonths,health:rand(65,100),year:game.year-Math.ceil(ageMonths/12),month:game.month,bond:0,learning:rand(0,25)};
        mother.children.push(c);addLog(`旧日皇嗣：${mother.name}育有${gender}${c.name}，现年${Math.floor(ageMonths/12)}岁${ageMonths%12}个月，性情${c.temperament}。`,true);
      }
    }
    renderGame();saveGame('auto');
  };
  const v4Restore=restore;
  restore=function(data){v4Restore(data);initializeWorld();renderGame();};
  const v4MakeCourt=makeCourtPerson;
  makeCourtPerson=function(...args){const p=v4MakeCourt(...args);addCharacterDetails(p);return p;};
  function shop(){openModal('琳琅阁','以文钱购买礼品；购物不消耗回合，赠礼消耗一次行动。',goods.map(item=>({label:`${item.name} · ${item.price}文`,note:`${item.tag} · 现有${game.money}文`,run:()=>{if(game.money<item.price)return showToast('私房钱不足');game.money-=item.price;game.inventory.push(item.name);addLog(`你花费${item.price}文购入${item.name}。`,false);renderGame();saveGame('auto');showToast('已收入礼匣');}})));}
  function giftTag(item){return goods.find(g=>g.name===item)?.tag || (item==='云锦香囊'?'刺绣':'香品');}
  giftAction=function(){
    if(!game.inventory.some(item=>!poisons.some(p=>p.name===item)))return showToast('礼匣暂无物品，可前往琳琅阁购买或亲手制作');
    openModal('赠礼结交','投其所好可获得更多好感，触犯忌好反而可能适得其反。',game.court.filter(p=>!p.dead&&!p.banished).map(p=>({label:`${p.name} · ${p.rank}`,note:`喜爱${p.preference} · 不喜${p.dislike} · ${p.faction}`,run:()=>openModal('挑选礼物',`${p.name}偏爱${p.preference}。`,game.inventory.map((item,i)=>({item,i})).filter(({item})=>!poisons.some(p=>p.name===item)).map(({item,i})=>({label:item,note:giftTag(item),run:()=>{
      game.inventory.splice(i,1);
      if(item==='藏毒沉香'){resolvePoison(p,poisons[1]);changeRelation(p,-25);finishAction(`你借藏毒沉香暗害${p.name}，看似平静的赠礼藏着杀机。`);return;}
      const tag=giftTag(item);const liked=tag===p.preference;const disliked=tag===p.dislike;
      const handmade=['云锦香囊','清心兰香','合欢夜香'].includes(item);
      const base=handmade?8+game.skills[item==='云锦香囊'?'女红':'香料']:10;
      const gain=Math.round(disliked?-3:base*(liked?2:1));changeRelation(p,gain);
      finishAction(`你将${item}送给${p.name}。${liked?'正合她的心意，她展颜道谢。':disliked?'她不喜此物，勉强收下后便移开了话题。':'她依礼道谢，记下了这份心意。'}关系${gain>=0?'+':''}${gain}。`);
    }})))})));
  };
  function factionMenu(){openModal('六宫阵营','加入阵营会改善同盟关系，也可能引来其他派系的戒心。',factions.map(name=>({label:name,note:game.court.filter(p=>!p.dead&&!p.banished&&p.faction===name).map(p=>p.name).join('、')||'暂无成员',run:()=>{
    if(game.faction===name)return showToast('你已属于此阵营');game.faction=name;for(const p of game.court)if(!p.dead&&!p.banished)changeRelation(p,p.faction===name?8:name==='独善其身'?0:-3);
    finishAction(`你选择${name==='独善其身'?'暂不依附任何一方':`与${name}往来`}，宫中的人情开始重新排列。`);
  }})));}
  function palaceIntrigue(){
    const live=game.court.filter(p=>!p.dead&&!p.banished);if(!live.length)return;const p=pick(live);const kids=[...game.children,...live.flatMap(p=>p.children)].filter(c=>!c.dead);
    const events=[
      {title:'红绢喜脉',text:`${p.name}忽然称有孕，却迟迟不许太医诊脉。宫人私下传言，她想借假孕重获圣眷。`,choices:[{label:'请中宫遣太医复核',run:()=>{if(rand(1,100)<=55){p.favor=clamp(p.favor-12);p.reputation=clamp(p.reputation-15);addLog(`${p.name}假孕之事坐实，御前收回赏赐，内廷彻查串通的宫人。`,true);}else addLog(`太医复核后证实${p.name}并非假孕，流言渐息。`,true);game.prestige=clamp(game.prestige+2);}}, {label:'暂不卷入',run:()=>addLog('你将喜脉传闻留在宫门之外，静候内廷查验。',true)}]},
      {title:'月例亏空',text:`${p.faction}的宫人卷入月例账册争议，${p.name}请你出面作证。`,choices:[{label:'核对账册后按实禀报',run:()=>{game.prestige=clamp(game.prestige+4);changeRelation(p,game.faction===p.faction?8:-3);addLog('你逐项核实账册，追回的亏空发还宫人。',true);}}, {label:'婉言谢绝',run:()=>{changeRelation(p,-3);addLog('你以不熟悉账册为由婉拒作证，对方失望而归。',true);}}]},
      {title:'夜半密信',text:`有人递来一封指控${p.name}的密信，落款却被涂去。`,choices:[{label:'交皇后核验',run:()=>{game.reputation=clamp(game.reputation+3);addLog('皇后发现密信笔迹刻意模仿，命人封存证物，暂不定罪。',true);}}, {label:'当面交还，提醒她提防',run:()=>{changeRelation(p,10);addLog(`${p.name}收下密信，对你多了一分信任。`,true);}}]},
      {title:'失落的香方',text:`你的香方在宴后不见了，宫人看见${p.name}的侍女来过。`,choices:[{label:'查清往来，不急定罪',run:()=>{game.prestige=clamp(game.prestige+3);addLog('香方原来夹在旧书中。你庆幸自己没有贸然指责旁人。',true);}}, {label:'请她协助寻找',run:()=>{changeRelation(p,5);addLog(`${p.name}遣人帮忙，香方终于在书房寻回。`,true);}}]}
    ];
    if(kids.length)events.push({title:'皇嗣药盏',text:'皇嗣所用的药盏被人动过手脚，乳母赶来求援。',choices:[{label:'立即请太医验毒',run:()=>{const c=pick(kids);const protectedChance=clamp(35+game.skills['医学']*5+(c.nurse?10:0),35,95);if(rand(1,100)<=protectedChance){c.health=clamp(c.health-5);addLog(`太医在${c.name}的药盏中验出异物，及时救治，孩子脱险。此案线索移交中宫。`,true);}else {c.dead=true;c.health=0;addLog(`${c.gender}${c.name}未能熬过这一夜，太医确认中毒，宫中为此彻查。`,true);}game.reputation=clamp(game.reputation+3);}}, {label:'先保护自己宫中的孩子，再交内廷查办',run:()=>{const c=pick(kids);if(rand(1,100)<=18){c.dead=true;c.health=0;addLog(`${c.name}因药盏中的毒物不幸夭折，内廷封锁膳房。`,true);}else addLog('内廷封存药盏，太医及时解毒，皇嗣暂时平安。',true);}}]});
    const e=pick(events);openModal(e.title,e.text,e.choices.map(c=>({label:c.label,run:()=>{c.run();renderGame();saveGame('auto');}})),'宫闱暗流');
  }
  function personalityEvent(){
    const p=pick(game.court.filter(p=>!p.dead&&!p.banished));if(!p)return;
    const scenes={
      '温婉':['春日赠花',`${p.name}带来一束新开的海棠，问你近日可好。`,'留她饮茶','她与你谈起家乡，关系渐暖。'],
      '爽朗':['投壶小宴',`${p.name}邀你投壶，说不论输赢都备了好茶。`,'欣然应邀','你们在笑声中玩了半日，彼此更为亲近。'],
      '城府深沉':['话中藏针',`${p.name}试探你对另一阵营的看法，似乎正等一句可以转述的话。`,'以宫规为答','你不置评旁人，只谈宫规，她也无从借题发挥。'],
      '骄矜':['席间争座',`${p.name}不愿与你同席，命人另搬坐席。`,'从容守礼','你依位分入座，没有失了仪态。'],
      '谨慎':['封缄的账簿',`${p.name}请你一同查验礼品收支，免得遭人借题发挥。`,'帮她核对','账目逐一对清，她对你的信任更深了。'],
      '争强好胜':['题诗较艺',`${p.name}邀你同题作诗，席间众人已取来笔墨。`,'坦然应题','一场较艺让彼此知道了对方的才情。'],
      '淡泊':['竹窗听雨',`${p.name}闭门听雨，不理宫中争宠的传闻。`,'携茶静坐','你们听雨闲谈，暂时忘却宫门内的纷争。'],
      '善妒':['花笺流言',`${p.name}见你得赏，言语中多有讥讽。`,'请她当面说清','你没有让流言暗中发酵，双方的嫌隙却更深了一分。']
    };const s=scenes[p.temperament]||scenes['谨慎'];
    openModal(s[0],s[1],[{label:s[2],run:()=>{changeRelation(p,p.temperament==='善妒'?-5:8);game.prestige=clamp(game.prestige+2);finishPlot(s[3]);}}, {label:'以礼告辞',run:()=>finishPlot('你行礼离开，没有进一步介入这段往来。')}],'六宫性情');
  }
  const v4Monthly=monthlyTick;
  monthlyTick=function(m){
    initializeWorld();const amount=salary();game.money+=amount;
    addLog(`【内廷月例】按${game.rank}品阶，领到月例钱${amount}文；现有${game.money}文。`,true);
    for(const p of [game,...game.court])for(const c of p.children)if(!c.dead)c.ageMonths++;
    v4Monthly(m);normalizeRanks();
    if(!game.ended&&$('choiceModal').classList.contains('hidden')){const n=rand(1,100);if(n<=35)palaceIntrigue();else if(n<=70)personalityEvent();}
  };
  const v4Offspring=offspringRender;
  offspringRender=function(){
    v4Offspring();
    const children=[...game.children.map(c=>({...c,mother:game.name})),...game.court.flatMap(p=>p.children.map(c=>({...c,mother:p.name})))];
    $('offspringCount').textContent=children.filter(c=>!c.dead).length;
    const rows=children.map(c=>`<div class="offspring-item ${c.dead?'deceased':''}"><b>${escapeHtml(c.name)}</b> · ${c.gender}${c.dead?' · 已故':''}<small>${Math.floor((c.ageMonths||0)/12)}岁${(c.ageMonths||0)%12}月 · 生母：${escapeHtml(c.mother)} · ${c.temperament}<br>乳母：${c.nurse||'未安排'} · 老师：${c.teacher||'未安排'} · 亲近${c.bond||0} · 学业${c.learning||0}</small></div>`).join('');
    if(rows)$('offspringList').innerHTML=rows+(game.pregnancy?`<div class="pregnancy-status">你正在养胎，预计${game.pregnancy.months}个月后临盆。</div>`:'');
  };
  applyMaxCheat=function(){
    const fields=[...Object.keys(statNames).map(k=>({key:'stat:'+k,label:statNames[k],value:game.stats[k],max:k==='fertility'?25:100})),...skillNames.map(k=>({key:'skill:'+k,label:k,value:game.skills[k],max:10})),...['favor','trueHeart','talent','prestige','reputation','money','remainingLifeMonths','emperorLife'].map(k=>({key:k,label:({favor:'圣眷',trueHeart:'皇帝真心',talent:'天资',prestige:'威望',reputation:'名声',money:'私房钱（文）',remainingLifeMonths:'自身余寿（月）',emperorLife:'皇帝余寿（月）'})[k],value:game[k]||0,max:['money','remainingLifeMonths','emperorLife'].includes(k)?999999:100}))];
    showCheatReport(`<b>自在命簿 · 属性编辑</b><div class="cheat-fields">${fields.map((f,i)=>`<label>${f.label}<input type="number" id="edit-${i}" min="0" max="${f.max}" step="${f.key.startsWith('skill:')?'.1':'1'}" value="${f.value}"></label>`).join('')}</div><button id="applyAttributes" class="primary-btn">保存属性修改</button>`);
    $('applyAttributes').onclick=()=>{for(let i=0;i<fields.length;i++){const f=fields[i];const n=Number($('edit-'+i).value);if(!Number.isFinite(n)||n<0||n>f.max)return showToast(`${f.label}超出范围`);}
      fields.forEach((f,i)=>{const n=Number($('edit-'+i).value);if(f.key.startsWith('stat:'))game.stats[f.key.slice(5)]=Math.round(n);else if(f.key.startsWith('skill:'))game.skills[f.key.slice(6)]=Math.round(n*10)/10;else game[f.key]=Math.round(n);});
      game.favorRevealed=true;renderGame();saveGame('auto');showToast('属性已保存');};
  };
  const v4RenderLog=renderLog;
  renderLog=function(){v4RenderLog();document.querySelectorAll('.story-entry').forEach(el=>{if(el.textContent.includes('陛下翻了你的牌'))el.classList.add('player-chosen');if(el.textContent.includes('【月序更替】'))el.classList.add('month-entry');});};
  const v4Render=renderGame;
  renderGame=function(){
    if(game){initializeWorld();}
    v4Render();if(!game)return;
    $('purseValue').textContent=`${game.money}文 · 月例${salary()}文`;
    $('factionValue').textContent=game.faction;
    $('rankOccupancy').innerHTML=rankGroups.slice().reverse().map(g=>`<div><b>${g.join(' / ')}</b><span>${g.map(r=>`${r} ${rankCount(r)}/${rankLimit(r)===Infinity?'不限':rankLimit(r)}`).join(' · ')}</span></div>`).join('');
    $('courtList').querySelectorAll('.court-person').forEach(el=>{const p=game.court.find(p=>p.id===el.dataset.person);if(p){const detail=document.createElement('small');detail.className='court-preference';detail.textContent=`${p.faction} · 喜${p.preference} · 忌${p.dislike}`;el.append(detail);}});
  };
  const purse=document.createElement('div');purse.className='panel compact-panel';purse.innerHTML='<div class="panel-title">私房与阵营</div><p id="purseValue"></p><p id="factionValue"></p><small>月例参考《通典》开元官俸月俸钱，按位分品阶折算为游戏内廷月例，并非史料直接记载的妃嫔定额。</small>';
  document.querySelector('.left-column').prepend(purse);
  const occupancy=document.createElement('details');occupancy.className='rank-reference panel';occupancy.innerHTML='<summary>六宫名额与晋升规则</summary><p class="rank-note">贵妃高于淑妃、德妃、贤妃；后三妃同级。九嫔同级，晋位直接进入下一品阶，遇满额则候缺。美人限12人为本游戏设定。</p><div class="rank-grid" id="rankOccupancy"></div>';
  document.querySelector('.game-heading').after(occupancy);
  [['琳琅阁','shop'],['六宫阵营','faction']].forEach(([label,kind])=>{const b=document.createElement('button');b.className='action-card';b.innerHTML=`<b>${label}</b><small>${label==='琳琅阁'?'购买古风礼品':'查看与选择阵营'}</small>`;b.onclick=()=>{if(game&&!game.ended&&!game.acted)act(kind);};document.querySelector('.action-grid').append(b);});

  portrait=function(seed){
    const h=(seed*79)%360;const id='p'+seed;const flowers=Array.from({length:7},(_,i)=>`<g transform="translate(${47+i*14},${37+Math.abs(3-i)*3})"><path d="M-4 0Q-6 -8 0 -5Q6 -8 4 0Q8 5 0 4Q-8 5 -4 0" fill="${i%2?'#c6a66a':'#8c4258'}"/><circle r="1.6" fill="#f7dda2"/></g>`).join('');
    return `<svg viewBox="0 0 180 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="精绘古风宫装立绘"><defs><linearGradient id="${id}bg" x2="1" y2="1"><stop stop-color="#ebe0cc"/><stop offset="1" stop-color="#b2b6a1"/></linearGradient><linearGradient id="${id}dress" x2="1" y2="1"><stop stop-color="hsl(${h} 32% 65%)"/><stop offset="1" stop-color="hsl(${h} 37% 29%)"/></linearGradient><radialGradient id="${id}skin"><stop stop-color="#fae5d1"/><stop offset=".8" stop-color="#efd2bc"/><stop offset="1" stop-color="#d7ad96"/></radialGradient><linearGradient id="${id}hair" x2="1"><stop stop-color="#171b1c"/><stop offset=".45" stop-color="#3c302f"/><stop offset="1" stop-color="#171b1c"/></linearGradient><pattern id="${id}silk" width="24" height="30" patternUnits="userSpaceOnUse"><path d="M12 8q-9 -8 -5 3q-7 8 5 6q12 2 5-6q4-11-5-3M12 17v9" fill="none" stroke="#e5d1a1" stroke-width=".5" opacity=".6"/></pattern></defs><rect width="180" height="260" fill="url(#${id}bg)"/><circle cx="134" cy="49" r="25" fill="#fff1ce" opacity=".75"/><path d="M0 160L40 102L75 148L115 89L180 157V260H0Z" fill="#6d8479" opacity=".15"/><path d="M9 0Q31 61 16 139M20 45l27-18M20 71l-15-12M20 102l21-17" fill="none" stroke="#7b7e63" opacity=".4"/><path d="M25 260Q24 180 67 161L114 161Q157 179 163 260" fill="url(#${id}dress)"/><path d="M25 260Q24 180 67 161L114 161Q157 179 163 260" fill="url(#${id}silk)"/><path d="M58 160Q46 108 50 69Q45 22 87 26Q130 20 132 65Q139 111 122 163" fill="url(#${id}hair)"/><ellipse cx="88" cy="28" rx="25" ry="17" fill="url(#${id}hair)"/><path d="M80 143L78 166L90 181L105 164L103 141" fill="url(#${id}skin)"/><ellipse cx="90" cy="106" rx="33" ry="46" fill="url(#${id}skin)"/><path d="M57 83Q75 76 91 51Q105 73 122 84L118 57Q80 32 60 63Z" fill="url(#${id}hair)"/><path d="M59 80Q67 59 85 51M103 52Q120 64 122 78M60 70Q65 50 83 43" stroke="#70605a" stroke-width=".65" opacity=".65" fill="none"/><path d="M68 99Q75 94 83 98M98 98Q106 94 113 99" stroke="#62443d" stroke-width="1.2" fill="none"/><path d="M69 106Q76 102 83 106M98 106Q105 102 112 106" stroke="#5c3c36" stroke-width="1.2" fill="none"/><ellipse cx="77" cy="106" rx="1.8" ry="2" fill="#352e2b"/><ellipse cx="104" cy="106" rx="1.8" ry="2" fill="#352e2b"/><path d="M90 107l-2 14 5 1" stroke="#c69782" stroke-width=".8" fill="none"/><ellipse cx="70" cy="119" rx="8" ry="4" fill="#d78d8b" opacity=".22"/><ellipse cx="111" cy="119" rx="8" ry="4" fill="#d78d8b" opacity=".22"/><path d="M82 132Q89 128 96 132Q90 139 82 132" fill="#ad5863"/><path d="M86 132h7" stroke="#f5c3ba" stroke-width=".7"/><path d="M89 88l2-4 2 4-2 3Z" fill="#ab4b50"/><path d="M45 47L137 39" stroke="#b69858" stroke-width="2.5"/>${flowers}<path d="M51 48v34m77-38v37" stroke="#c7ac70" stroke-width=".8"/><circle cx="51" cy="84" r="3" fill="#ead7ac"/><circle cx="128" cy="82" r="3" fill="#ead7ac"/><path d="M65 162L89 205L115 162L106 159L90 186L74 159Z" fill="#f3e7d0"/><path d="M66 166l24 43 26-43M90 209l24 51" stroke="#d8ba7c" stroke-width="2" fill="none"/><path d="M35 193Q19 230 42 258M145 193Q163 232 139 258" stroke="#f0dbc4" stroke-width="13" opacity=".65" fill="none"/><path d="M52 259Q59 234 81 239Q88 242 93 247Q103 237 113 239Q129 244 131 259" fill="url(#${id}skin)"/><path d="M61 251l26-4m-22 9 23-6m12-3 20 6" fill="none" stroke="#c39c86" stroke-width=".8"/><rect x="6" y="6" width="168" height="248" rx="77" fill="none" stroke="#c7ad7d" stroke-width=".7" opacity=".6"/></svg>`;
  };

  const palaceNames=['承华宫','凝芳宫','昭阳宫','绮云宫','听雪宫','漪兰宫','映月宫','棠梨宫','流霜宫','栖霞宫','含章宫','玉芙宫'];
  const locations=[
    {id:'residence',name:'寝宫',x:90,y:258,actions:['study','rest','craft']},
    {id:'emperor',name:'紫宸殿',x:350,y:58,actions:['heir','incense']},
    {id:'banquet',name:'麟德殿',x:560,y:138,actions:['attend','showcase']},
    {id:'empress',name:'凤仪宫',x:140,y:95,actions:['social','gift','selection','faction']},
    {id:'garden',name:'御花园',x:350,y:190,actions:['rumor']},
    {id:'temple',name:'静心佛堂',x:550,y:280,actions:['pray']},
    {id:'medicine',name:'尚药局',x:170,y:365,actions:['poison']},
    {id:'children',name:'撷芳馆',x:390,y:338,actions:['children']},
    {id:'shop',name:'琳琅阁',x:570,y:380,actions:['shop']}
  ];
  const actionNames={study:'习文修艺',rest:'闭门养息',craft:'绣坊香室',heir:'承宠祈嗣',incense:'御前用香',attend:'赴宴献艺',showcase:'展示技艺',social:'拜访妃嫔',gift:'赠礼结交',selection:'建议选秀',faction:'阵营往来',rumor:'打探与流言',pray:'焚香祈福',poison:'暗中施毒',children:'子嗣教养',shop:'购买礼品'};
  function roundOne(n){return Math.round(n*10)/10;}
  function makeStaff(role,name=null){return {name:name||pick(surnames)+pick(role==='乳母'?['嬷嬷','乳娘']:['先生','学士','女史']),role,care:rand(20,100),learning:rand(20,100),loyalty:rand(20,100),temperament:pick(['细致','严谨','耐心','慈和','寡言'])};}
  function staffText(staff){return `${staff.name} · ${staff.temperament} · 照料${staff.care} / 学识${staff.learning} / 忠诚${staff.loyalty}`;}
  const v5Initialize=initializeWorld;
  initializeWorld=function(){
    v5Initialize();game.customFactions ||= [];game.location ||= 'residence';game.heartEvents ||= {};
    [game,...game.court].forEach((p,i)=>{
      if(p!==game)p.trueHeart ??=rand(5,78);
      p.palace ||= p.empress?'凤仪宫':palaceNames[(i+Number(game.portraitSeed||0))%palaceNames.length];
      p.chamber=rankTier(p.rank)>=6?'主殿':'偏殿';
      if(p.empress)p.chamber='主殿';
      p.children.forEach(c=>{
        if(c.nurse&&!c.nurseStats)c.nurseStats=makeStaff('乳母',c.nurse);
        if(c.teacher&&!c.teacherStats)c.teacherStats=makeStaff('老师',c.teacher);
      });
    });
  };
  gainFavor=function(base){
    const scarcity=game.favor>=90?.13:game.favor>=75?.25:.5;
    const gain=roundOne(base*(.4+game.trueHeart/100)*scarcity);
    game.favor=roundOne(clamp(game.favor+gain));game.playerFavoredThisMonth=true;revealFavor();return gain;
  };
  const v5Heart=heartChange;
  heartChange=function(...args){
    const before=game.trueHeart;v5Heart(...args);const delta=game.trueHeart-before;
    game.trueHeart=roundOne(clamp(before+delta*(delta>0?(before>=90?.08:before>=75?.15:.3):.5)));
  };
  function skillReaction(skill,context='御前献艺'){
    const level=game.skills[skill];let text;
    if(level>=8){gainFavor(2);heartChange('good',3);game.prestige=clamp(game.prestige+3);text='满座静听，继而交口称赞。陛下含笑颔首，命人赐赏，连素来挑剔的妃嫔也无从指摘。';}
    else if(level>=5){gainFavor(1);game.reputation=clamp(game.reputation+2);text='席间渐渐安静，有人轻声称好。陛下略加赞许，宫人记住了你的才情。';}
    else if(level>=3){game.prestige=clamp(game.prestige+1);text='众人依礼鼓掌，表演尚算稳妥，却未能让陛下多留片刻。';}
    else {game.reputation=clamp(game.reputation-2);game.favor=roundOne(clamp(game.favor-.5));text='技艺生疏，席间有人掩袖窃笑。陛下移开目光，掌事宫人赶忙替你圆场。';}
    return `【${context}】你展示${skill}（${level.toFixed(1)}/10）。${text}`;
  }
  function showcase(){openModal('麟德殿 · 展示技艺','技艺越精进，越容易赢得满座赞许；生疏时则可能出丑。',skillNames.map(skill=>({label:`展示${skill}`,note:`技艺 ${game.skills[skill].toFixed(1)}/10`,run:()=>finishAction(skillReaction(skill))})));}
  actionAttend=showcase;
  function childDetails(c){return `${c.gender}${c.name} · ${Math.floor((c.ageMonths||0)/12)}岁 · ${c.temperament}。${c.nurseStats?'乳母：'+staffText(c.nurseStats)+'。':''}${c.teacherStats?'老师：'+staffText(c.teacherStats)+'。':''}`;}
  childAction=function(){
    const records=[...game.children.filter(c=>!c.dead).map(c=>({c,owner:game})),...game.court.filter(p=>!p.dead&&!p.banished&&!p.banished).flatMap(p=>p.children.filter(c=>!c.dead).map(c=>({c,owner:p})))];
    if(!records.length)return showToast('宫中尚无在世皇嗣');
    openModal('撷芳馆 · 皇嗣教养','照料影响健康，学识影响学业，忠诚影响照料效果和防护。',records.map(({c,owner})=>({label:`${c.name} · 生母${owner.name}`,note:childDetails(c),run:()=>{
      if(owner!==game)return openModal('探望皇嗣',childDetails(c),[{label:'赠书问候',run:()=>{game.reputation=clamp(game.reputation+1);changeRelation(owner,3);finishAction(`你在撷芳馆探望${c.name}，与${owner.name}也多了几分交情。`);}}]);
      const recruit=role=>{
        game.staffCandidates ||= {};const key=`${c.id}-${role}-${game.year}-${game.month}`;
        const candidates=game.staffCandidates[key] ||= Array.from({length:3},()=>makeStaff(role));
        openModal(`遴选${role}`,childDetails(c),candidates.map(staff=>({label:staff.name,note:staffText(staff),run:()=>{if(role==='乳母'){c.nurse=staff.name;c.nurseStats=staff;}else{c.teacher=staff.name;c.teacherStats=staff;}finishAction(`你为${c.name}聘请${staff.name}担任${role}。${staffText(staff)}。`);}})));
      };
      openModal('安排起居与教养',childDetails(c),[
        {label:'遴选乳母',run:()=>recruit('乳母')},{label:'遴选老师',run:()=>recruit('老师')},
        {label:'一起读书',run:()=>{c.bond=clamp((c.bond||0)+5);c.learning=clamp((c.learning||0)+3);finishAction(`你在撷芳馆陪${c.name}读书，孩子的学业与亲近都有所增长。`);}},
        {label:'庭院游玩',run:()=>{c.bond=clamp((c.bond||0)+8);c.health=clamp((c.health||70)+2);finishAction(`你带${c.name}到御花园游玩，孩子笑着跑向你。`);}}
      ]);
    }})));
  };
  function heartThresholds(){
    const people=[game,...game.court].filter(p=>!p.dead&&!p.banished&&!p.banished);
    const perfect=people.find(p=>p.trueHeart===100&&p.favor===100);
    if(perfect&&!game.dismissedFor){
      const key=perfect===game?'player':perfect.id;game.dismissedFor=key;
      addLog(`【罢黜六宫】${game.emperorName}对${perfect.name}的圣眷与真心皆达极致，下诏遣散其余宫眷，独留一人相伴。朝臣力谏，诏意未改。`,true);
      people.filter(p=>p!==perfect).forEach(p=>{p.banished=true;p.authority=false;});
      if(perfect!==game){game.ended=true;hide('choiceModal');addLog('你奉诏离宫，携私物与子嗣安置于别院。此局以离宫终章落幕。',true);}
    }
    const exclusive=people.filter(p=>!p.banished&&p.favor>90).sort((a,b)=>b.favor-a.favor||b.trueHeart-a.trueHeart)[0];
    const exclusiveId=exclusive?(exclusive===game?'player':exclusive.id):null;
    if(exclusiveId!==game.exclusiveId){game.exclusiveId=exclusiveId;if(exclusive)addLog(`【专宠】${exclusive.name}圣眷逾九十，陛下近日明显偏宠于她，其余宫眷仍有少量承宠机会。`,true);else if(game.exclusiveName)addLog('御前重新恢复翻牌，近日专宠渐渐退去。',true);}
    game.exclusiveName=exclusive?.name||null;
    for(const p of people){if(p.banished)continue;const key=p===game?'player':p.id;
      if(p.favor>85&&p.trueHeart>85&&game.heartEvents[key]!==`${game.year}-${game.month}`){
        game.heartEvents[key]=`${game.year}-${game.month}`;
        addLog(`【皇帝今日不上朝】${game.emperorName}留宿${p.name}的${p.palace}${p.chamber}，晨鼓已过仍未临朝。六宫议论，谏官递上奏疏。`,true);
        for(const rival of game.court)if(rival!==p&&!rival.dead&&!rival.banished&&p===game)changeRelation(rival,-2);
      }
    }
  }
  flipWeights=function(){
    if(!game.emperorAlive)return null;
    const available=[game,...game.court].filter(p=>!p.dead&&!p.banished&&!p.banished&&!p.pregnancy);
    if(game.exclusiveId){const exclusive=available.find(p=>(p===game?'player':p.id)===game.exclusiveId);return exclusive||null;}
    if(rand(1,100)<(game.emperorType==='冷漠'?35:10))return null;
    const weights=available.map(p=>12+p.favor*.2+p.trueHeart*.1+(p===game&&game.requestedIntimacy?20:0));
    let roll=Math.random()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<available.length;i++){roll-=weights[i];if(roll<=0)return available[i];}return null;
  };
  resolveFlip=function(){
    initializeWorld();heartThresholds();if(game.ended)return;
    const p=flipWeights();game.requestedIntimacy=Boolean(game.requestedIntimacy);
    if(!p){game.requestedIntimacy=false;addLog('夜深，陛下未翻任何人的牌，六宫各自安歇。',true);return;}
    if(p===game){gainFavor(rand(1,2));heartChange('good',3);game.prestige=clamp(game.prestige+1);addLog(`今夜，陛下翻了你的牌，驾临${game.palace}${game.chamber}。夜色沉沉，圣眷与帝心只略有变化。`,true);}
    else {
      const scale=p.favor>=90?.15:p.favor>=75?.3:.5;p.favor=roundOne(clamp(p.favor+rand(1,2)*scale));
      const shift=game.emperorType==='冷漠'?(rand(1,100)<8?.2:0):game.emperorType==='风流'?rand(-5,6)/10:game.emperorType==='邪恶'?rand(-3,3)/10:rand(-1,4)/10;
      p.trueHeart=roundOne(clamp(p.trueHeart+shift*(p.trueHeart>=85?.4:1),0,game.emperorType==='温柔'?91:100));
      addLog(`今夜，陛下翻了${p.name}的牌，驾临${p.palace}${p.chamber}。`,true);
    }
    if(chanceToConceive(p))addLog(`太医诊出${p===game?'你':p.name}有孕，内廷记下喜脉。`,true);
    game.requestedIntimacy=false;heartThresholds();
  };
  const v5Selection=selection;
  selection=function(){if(game.dismissedFor){addLog('六宫已罢，陛下不再举行选秀。',true);return;}v5Selection();};
  function createFaction(){
    show('choiceModal');$('modalTitle').textContent='创立自己的阵营';$('modalText').textContent='阵营名最多八字，创建后可逐一邀请妃嫔。';$('modalEyebrow').textContent='六宫结盟';
    $('modalChoices').innerHTML='<label>阵营名<input id="newFactionName" maxlength="8" placeholder="如：听雨同盟"></label><button class="choice-btn" id="confirmFaction">创立阵营</button>';
    $('confirmFaction').onclick=()=>{
      const name=$('newFactionName').value.trim();if(!name||name.length>8)return showToast('请输入一至八字阵营名');
      if([...factions,...game.customFactions.map(f=>f.name)].includes(name))return showToast('阵营名称已存在');
      game.customFactions.push({name,founder:'player'});game.faction=name;hide('choiceModal');finishAction(`你在凤仪宫旁的暖阁召集心腹，立下「${name}」，从此有了自己的阵营。`);
    };
  }
  function inviteFaction(){
    if(!game.customFactions.some(f=>f.name===game.faction&&f.founder==='player'))return showToast('请先创立自己的阵营');
    openModal('邀请结盟',`当前阵营：${game.faction}。交情、名声和性格影响对方是否愿意加入。`,game.court.filter(p=>!p.dead&&!p.banished&&!p.banished&&p.faction!==game.faction).map(p=>({label:`邀请${p.name}`,note:`${p.temperament} · 当前${p.faction} · 关系${game.relations[p.id]||0}`,run:()=>{
      game.factionInvites ||= {};if(game.factionInvites[p.id]===`${game.year}-${game.month}`)return showToast('本月已邀请过她');game.factionInvites[p.id]=`${game.year}-${game.month}`;
      const chance=clamp(20+(game.relations[p.id]||0)*.45+game.reputation*.2+(p.temperament==='淡泊'?-25:p.temperament==='爽朗'?10:0),5,90);
      if(rand(1,100)<=chance){p.faction=game.faction;changeRelation(p,8);finishAction(`${p.name}接受你的邀约，正式加入${game.faction}。`);}else finishAction(`${p.name}婉拒了结盟邀请，表示仍需再作考虑。`);
    }})));
  }
  const v5FactionMenu=factionMenu;
  factionMenu=function(){openModal('阵营与盟友',`你属于${game.faction}。`,[
    {label:'创立阵营',run:createFaction},{label:'邀请妃嫔加入',run:inviteFaction},
    {label:'查看我的成员',run:()=>openModal(game.faction,'与你同阵营的人：',game.court.filter(p=>!p.dead&&!p.banished&&!p.banished&&p.faction===game.faction).map(p=>({label:p.name,note:p.rank+' · '+p.temperament,run:()=>showToast(`${p.name}与你同属${p.faction}`)})))},
    {label:'加入已有阵营',run:v5FactionMenu}
  ]);};
  const v5MonthlyEvent=monthlyEvent;
  monthlyEvent=function(){if(game.court.some(p=>!p.dead&&!p.banished&&!p.empress))v5MonthlyEvent();else addLog('宫中只余你与陛下，旧日六宫的纷争渐成往事。',false);};
  const v5Jealousy=highHeartJealousy;
  highHeartJealousy=function(){if(game.court.some(p=>!p.dead&&!p.banished&&!p.empress))v5Jealousy();};
  const v5Month=monthlyTick;
  monthlyTick=function(m){
    initializeWorld();const oldValues=game.court.map(p=>({p,favor:p.favor}));v5Month(m);
    oldValues.forEach(({p,favor})=>{if(p.favor>favor)p.favor=roundOne(favor+(p.favor-favor)*.1);});
    for(const p of [game,...game.court])for(const c of p.children){if(c.dead)continue;
      if(c.nurseStats)c.health=clamp((c.health||70)+Math.floor(c.nurseStats.care*c.nurseStats.loyalty/2500));
      if(c.teacherStats)c.learning=clamp((c.learning||0)+Math.floor(c.teacherStats.learning*c.teacherStats.loyalty/2500));
    }
    if(!game.ended)heartThresholds();
  };
  function mapRender(){
    $('locationLabel').textContent=`当前：${locations.find(l=>l.id===game.location)?.name||'寝宫'} · 居所：${game.palace}${game.chamber}`;
    const roads='<path d="M90 258L140 95L350 58L560 138L550 280L570 380L390 338L170 365L90 258M140 95L350 190L560 138M350 190L390 338M90 258L350 190L550 280" fill="none" stroke="#c8b496" stroke-width="9"/><path d="M140 95L350 190L560 138M350 190L390 338" fill="none" stroke="#eee2c9" stroke-width="2"/>';
    $('palaceMap').innerHTML=`<svg viewBox="0 0 700 440" role="img" aria-label="后宫活动地图"><rect x="8" y="8" width="684" height="424" rx="20" fill="#f2e8d4" stroke="#c6ad89"/><path d="M275 160Q355 135 420 194Q450 250 375 270Q300 250 275 160" fill="#acc5bb" opacity=".65"/>${roads}${locations.map(l=>`<g data-map-place="${l.id}" role="button" tabindex="0" aria-label="${l.name}" class="map-building ${game.location===l.id?'current':''}"><rect x="${l.x-48}" y="${l.y-23}" width="96" height="54" rx="3" fill="${game.location===l.id?'#e8c2a1':'#e7d4b4'}" stroke="#9a7155"/><path d="M${l.x-57} ${l.y-18}L${l.x} ${l.y-43}L${l.x+57} ${l.y-18}Z" fill="${game.location===l.id?'#a74442':'#6e6b59'}"/><path d="M${l.x-10} ${l.y+30}v-25h20v25" fill="#8c6b56"/><text x="${l.x}" y="${l.y+48}" text-anchor="middle" font-size="13" fill="#573f32">${l.id==='residence'?escapeHtml(game.palace):l.name}</text></g>`).join('')}</svg>`;
    const visit=el=>{const place=locations.find(l=>l.id===el.dataset.mapPlace);if(!place||game.ended||game.acted)return;
      game.location=place.id;mapRender();saveGame('auto');openModal(place.id==='residence'?game.palace+game.chamber:place.name,'选择在此进行的活动。移动不消耗回合，完成行动后自动入夜。',place.actions.map(kind=>({label:actionNames[kind],run:()=>act(kind)})));
    };
    $('palaceMap').querySelectorAll('[data-map-place]').forEach(el=>{el.onclick=()=>visit(el);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();visit(el);}};});
    $('palaceResidents').textContent=[game,...game.court].filter(p=>!p.dead&&!p.banished&&!p.banished).map(p=>`${p.name}：${p.palace}${p.chamber}`).join('；');
  }
  const v5Act=act;
  act=function(kind){
    if(!game||game.ended||game.acted)return;
    const place=locations.find(l=>l.actions.includes(kind));if(place){game.location=place.id;addLog(`【行止】你前往${place.id==='residence'?game.palace+game.chamber:place.name}。`,false);}
    if(kind==='showcase')showcase();else if(kind==='shop')shop();else if(kind==='faction')factionMenu();else v5Act(kind);
    mapRender();
  };
  const v5RenderWorld=renderGame;
  renderGame=function(){v5RenderWorld();if(!game)return;mapRender();
    $('profileFamily').textContent=`${game.family} · ${game.palace}${game.chamber}`;
    $('courtList').querySelectorAll('.court-person').forEach(el=>{const p=game.court.find(p=>p.id===el.dataset.person);if(p){const home=document.createElement('small');home.textContent=p.banished?'已奉诏离宫':p.palace+p.chamber;el.append(home);}});
    $('offspringList').insertAdjacentHTML('beforeend',game.children.filter(c=>!c.dead).map(c=>`<p class="staff-note">${escapeHtml(c.name)}：${c.nurseStats?escapeHtml(staffText(c.nurseStats)):'乳母待选'}<br>${c.teacherStats?escapeHtml(staffText(c.teacherStats)):'老师待选'}</p>`).join(''));
  };
  const v5Reveal=revealHiddenValues;
  revealHiddenValues=function(){initializeWorld();v5Reveal();$('cheatReport').insertAdjacentHTML('beforeend','<br><b>各宫帝心与圣眷</b><br>'+game.court.map(p=>`${escapeHtml(p.name)}：真心${p.trueHeart.toFixed(1)}，圣眷${p.favor.toFixed(1)}`).join('<br>'));};
  const mapPanel=document.createElement('details');mapPanel.className='panel palace-map-panel';mapPanel.open=true;mapPanel.innerHTML='<summary>禁中舆图 · 点击宫殿选择活动</summary><p id="locationLabel"></p><div id="palaceMap"></div><p id="palaceResidents"></p>';
  document.querySelector('.game-heading').after(mapPanel);
  [['showcase','展示技艺','众人反应随技能变化'],['faction','我的阵营','创立阵营与邀请结盟']].forEach(([key,label,note])=>{const b=document.createElement('button');b.className='action-card';b.innerHTML=`<b>${label}</b><small>${note}</small>`;b.onclick=()=>act(key);document.querySelector('.action-grid').append(b);});

  const intimacyReset=[0,8,15,25,35,45,60,72,82,90];
  const v6Init=initializeWorld;
  initializeWorld=function(){v6Init();game.storyHistory ||= [];game.crownPetitions ||= {};for(const p of [game,...game.court]){p.intimacyProgress ??=rand(0,40);for(const c of p.children){c.merit ??=rand(25,75);c.guard ??=rand(20,65);}}};
  function personKey(p){return p===game?'player':p.id;}
  const v6Threshold=heartThresholds;
  heartThresholds=function(){v6Threshold();};
  flipWeights=function(){
    const available=[game,...game.court].filter(p=>!p.dead&&!p.banished&&!p.pregnancy);
    if(!available.length||!game.emperorAlive)return null;
    const due=available.filter(p=>p.intimacyProgress>=100).sort((a,b)=>b.intimacyProgress-a.intimacyProgress||rankTier(b.rank)-rankTier(a.rank));
    if(due.length)return due[0];
    if(rand(1,100)<(game.emperorType==='冷漠'?35:10))return null;
    const weights=available.map(p=>(12+p.favor*.2+p.trueHeart*.1+(p===game&&game.requestedIntimacy?20:0))*(game.exclusiveId&&personKey(p)!==game.exclusiveId?.16:1));
    let roll=Math.random()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<available.length;i++){roll-=weights[i];if(roll<=0)return available[i];}return available.at(-1);
  };
  resolveFlip=function(){
    initializeWorld();heartThresholds();if(game.ended)return;
    for(const p of [game,...game.court])if(!p.dead&&!p.banished)p.intimacyProgress=Math.min(100,p.intimacyProgress+1);
    const formerFavorite=[game,...game.court].find(p=>personKey(p)===game.exclusiveId);const p=flipWeights();
    if(!p){game.requestedIntimacy=false;addLog('这一夜陛下未召幸任何人，禁中宫灯渐熄。',true);return;}
    const guaranteed=p.intimacyProgress>=100;
    const previous=p.favor;
    if(p===game){gainFavor(rand(1,2));heartChange('good',3);game.prestige=clamp(game.prestige+1);addLog(`今夜，陛下翻了你的牌，驾临${p.palace}${p.chamber}。${guaranteed?'久候的牌册终于轮到你，宫人赶忙点起灯。':'你敛袖相迎，夜色中又添一段宫中旧事。'}`,true);}
    else {p.favor=roundOne(clamp(p.favor+(p.favor>=90?.2:p.favor>=75?.3:.5)));p.trueHeart=roundOne(clamp(p.trueHeart+rand(-1,3)/10*(p.trueHeart>=85?.3:1)));addLog(`今夜陛下翻了${p.name}的牌，驾临${p.palace}${p.chamber}。${guaranteed?'内廷循牌册之序安排召幸。':''}`,true);}
    p.intimacyProgress=intimacyReset[Math.max(0,rankTier(p.rank))];
    if(formerFavorite&&formerFavorite!==p&&!formerFavorite.dead&&!formerFavorite.banished&&p.favor>previous){const loss=roundOne(Math.max(.5,(p.favor-previous)*1.5));formerFavorite.favor=roundOne(clamp(formerFavorite.favor-loss));addLog(`【宠爱分流】${p.name}新得圣眷，${formerFavorite.name}的圣眷回落${loss}。`,true);}
    if(chanceToConceive(p))addLog(`太医诊出${p===game?'你':p.name}有孕，喜讯传入内廷。`,true);
    game.requestedIntimacy=false;heartThresholds();
  };
  const drugPrices=[1800,2600,4800];
  const v6Shop=shop;
  shop=function(){openModal('琳琅阁 · 礼品与秘货','购买不耗回合，施毒时消耗一份毒药。',[
    {label:'挑选古风礼品',run:v6Shop},...poisons.map((p,i)=>({label:`${p.name} · ${drugPrices[i]}文`,note:`${p.note} · 现有${game.money}文`,run:()=>{if(game.money<drugPrices[i])return showToast('私房钱不足');game.money-=drugPrices[i];game.inventory.push(p.name);addLog(`你在琳琅阁的秘货账上购入一份${p.name}。`,false);renderGame();saveGame('auto');showToast('已收入药匣');}}))
  ]);};
  const v6Poison=actionPoison;
  actionPoison=function(){if(!poisons.some(p=>game.inventory.includes(p.name)))return showToast('药匣无毒药，请先在琳琅阁购买');v6Poison();};
  function royalSons(){return [game,...game.court].flatMap(m=>m.children.filter(c=>!c.dead&&c.gender==='皇子').map(c=>({c,m})));}
  function crownScore({c,m}){return (c.learning||0)*.4+c.merit*.25+(c.health||0)*.1+Math.min(c.ageMonths/12,18)*.8+(m.empress?12:0)+m.favor*.08+m.prestige*.08+(game.crownPetitions[c.id]||0);}
  function crownDecision(petition=false){
    const sons=royalSons();const candidates=sons.filter(({c})=>c.ageMonths>=72&&c.health>=40);
    const current=sons.find(({c})=>c.id===game.crownPrinceId);
    if(game.crownPrinceId&&!current){game.crownPrinceId=null;addLog('东宫失其储君，朝廷重新商议立储。',true);}
    if(!candidates.length)return;
    candidates.sort((a,b)=>crownScore(b)-crownScore(a)||b.c.ageMonths-a.c.ageMonths);
    const best=candidates[0];if(current&&current.c.id===best.c.id)return;
    if(current&&crownScore(best)<crownScore(current)+18)return;
    if(current&&!petition)return;
    game.crownPrinceId=best.c.id;game.crownMotherId=personKey(best.m);
    addLog(`【${current?'改立储君':'册立太子'}】${best.c.name}以${Math.floor(best.c.ageMonths/12)}岁之龄入主东宫。朝臣综合其学业、品行、健康、年齿及母族地位，奉诏立为太子。${current?'原储君改封亲王。':''}`,true);
  }
  function crownMenu(){openModal('东宫议储','皇子满6岁、健康不低于40可参选；综合学业40%、品行25%、健康10%，并参考年龄、生母位分与圣眷。已有太子时，仅明显更优秀者在正式奏请后可能取代。',[
    {label:'查看在世皇子',run:()=>openModal('皇子名册',`当前太子：${royalSons().find(s=>s.c.id===game.crownPrinceId)?.c.name||'未立'}`,royalSons().map(({c,m})=>({label:`${c.name} · ${c.id===game.crownPrinceId?'太子':'皇子'}`,note:`${Math.floor(c.ageMonths/12)}岁 · 生母${m.name} · 学业${c.learning||0} · 品行${c.merit} · 健康${c.health}`,run:()=>showToast(childDetails(c))})))},
    {label:'为自己的皇子奏请立储',run:()=>openModal('奏请议储','奏请消耗本回合，每年仅可一次。',game.children.filter(c=>!c.dead&&c.gender==='皇子'&&c.ageMonths>=72).map(c=>({label:c.name,run:()=>{if(game.lastCrownPetition===game.year)return showToast('本年已奏请立储');game.lastCrownPetition=game.year;game.crownPetitions[c.id]=8;crownDecision(true);finishAction(`你为${c.name}呈上学业考评，请求陛下与朝臣议储。`);}})))}
  ]);}
  const courtTales=[
    ['灯市遗簪','上元灯市归来，宫人捡到一枚不在册的金簪。有人想将它栽到别宫名下。','交尚宫局查册','你将簪子封存造册，物主终于寻回失物。','不理旁人的暗示','你没有卷入此事，将金簪留在值房。','reputation'],
    ['秋猎惊马','随驾秋猎时，一匹御马突然受惊，席间有人借机指责养马宫人。','替宫人说明经过','你还原了惊马的经过，避免宫人受冤。','先护好同来的孩子','你先安排众人避到安全处，再请侍卫处理。','prestige'],
    ['花宴换帖','花宴请帖的座次被人涂改，你的名字落在了不合位分的位置。','请掌事按宫规重排','掌事核对后重新排座，没有给流言留下把柄。','从容赴宴不作争执','你的从容让几位命妇留下了好印象。','prestige'],
    ['雪夜旧袍','大雪封了宫道，你发现守夜的宫人仍穿着旧袍。','拨钱添置冬衣','宫人领到棉衣，记住了你的体恤。','请尚宫局核查冬例','冬衣终于按名册补齐。','money'],
    ['梅枝入画','画师奉命为六宫作梅花小像，你可以借画说一句心事。','以诗题画','画师把诗句一并呈入御前。','只留一枝疏梅','那份留白反而让人多看了两眼。','wit'],
    ['端午香囊','端午宴上，有人说你的香囊用了宫中禁忌的香材。','当众请尚药局验香','验香结果并无不妥，谣言不攻自破。','收起香囊另行核验','你没有在席间争执，内廷事后查明了香方。','medicine'],
    ['莲池旧誓','你在莲池边听见两位宫女互相告别，其中一人即将年满出宫。','为她们送行','一份告别小礼，让离宫之路不再显得孤单。','写一封平安祝笺','那封祝笺被小心收进了行囊。','reputation'],
    ['贡锦争端','新到的贡锦数量有限，几宫的宫人争得面红耳赤。','按位分核对分例','你将分例核清，余下的锦缎留待统一赏赐。','让出自己的一匹','退让为你换来一分好名声。','prestige'],
    ['夜雨疑踪','一名内侍深夜经过宫门，留下半枚陌生的令牌。','交中宫核实身份','原是修缮宫墙的通行牌，误会就此解开。','命人守门不私下追查','你加强了守门，等尚宫局清点名册。','prestige'],
    ['中秋家书','中秋将至，家书里夹着一小片故乡的桂叶。','将桂叶封入香囊','熟悉的香气陪你度过了一个安静的夜晚。','向御前讲起故乡','你说起小时候的月色，陛下静静听完。','heart'],
    ['梨园争曲','梨园新曲在宫中流传，有人指责你私改曲谱以邀宠。','请乐师还原旧谱','曲谱的来龙去脉终于查清，众人各自散去。','当场奏出两版分别','乐师听出细节，席间的议论有了定论。','music'],
    ['春蚕开箔','尚功局邀你主持春蚕开箔，几位妃嫔借机观察你的举止。','依礼完成仪式','仪式顺遂，宫人称你举止端正。','向蚕妇请教','你的谦逊让熟悉蚕事的宫人倍感亲切。','social'],
    ['空匣疑云','送往太医院的药材匣少了一味药，送匣宫人急得落泪。','核对领用账目','少掉的药材原已按例移交，账目终于对上。','先补齐短缺药材','你先解燃眉之急，再让内廷补查记录。','medicine'],
    ['镜台流言','有人在旧铜镜背后发现一张不祥字条，六宫议论渐起。','请人封存而不宣扬','尚宫局认出那是旧戏词，流言逐渐淡去。','宽慰受惊的宫人','你让宫人先安歇，别再以讹传讹。','reputation'],
    ['荷灯漂远','七夕水面漂来一盏没有落款的荷灯，写着离宫归家的愿望。','替它续上一盏灯','你将祝愿留在水上，没有追问主人的秘密。','将荷灯交还值夜宫人','宫人悄悄收好灯，向你郑重行礼。','reputation'],
    ['密约换盟','一个与你不同阵营的妃嫔暗示愿用秘密换取结盟。','只谈合作不问隐私','你们约定互通公开消息，不用旁人的秘密作筹码。','谨慎婉拒','你婉拒这场密约，将决定留到看清局势之后。','prestige']
  ];
  courtTales.push(
    ['假传口谕','一名宫人声称奉了御前口谕，要带走你宫中的账册，却拿不出凭信。','派人到御前核实','御前并未下过这道口谕，假传之人交内廷查办。','暂缓交册，请中宫作证','中宫核验凭信，拦下了一场借名搜宫。','prestige'],
    ['药材调包','一包安胎药与送货名册对不上，有人急着让乳母拿去煎药。','请太医重新核验','太医发现药包封口被动过，另开新方，皇嗣免于受害。','封存药包，另请太医','你先停下用药，内廷循着收药记录查出错漏。','medicine'],
    ['私印风波','一封诬告宫人偷盗的书信上，盖着与你宫中极相似的印记。','当众核对印泥与笔迹','那枚私印刻漏了一笔，嫁祸的破绽终于显露。','请皇后主持查验','皇后命人比对封存旧信，暂时洗清了嫌疑。','prestige'],
    ['盟中反间','有人散布你准备抛弃盟友的消息，几位宫人已在私下传话。','请盟友当面说开','你将来往之事逐一说清，离间的流言失去了凭据。','暂不争辩，依约往来','持续履约让人逐渐放下疑心。','social'],
    ['被换的贺礼','你的寿宴贺礼忽然被换成一件破损旧物，礼单却已送入御前。','出示原礼单与收据','掌事对照记录，发现移交途中有人开过礼匣。','当众请罪后再请核验','你先守住礼数，随后请求内廷追查交接。','reputation'],
    ['借刀之计','有人向你递上一份所谓的铁证，怂恿你立即弹劾一位受宠妃嫔。','独立核实证词','证词的时间互相矛盾，你识破了借你之手除人的圈套。','将材料交中宫封存','你没有冒然定罪，让内廷循规查验。','prestige']
  );
  function taleReward(tag,bold){
    if(tag==='money'&&bold){if(game.money>=300){game.money-=300;game.reputation=clamp(game.reputation+3);}else addLog('私房钱不足，你只得改请内廷核查。',false);}
    else if(tag==='heart'&&bold){gainFavor(.6);heartChange('good',2,true);}
    else if(['medicine','music','wit','social'].includes(tag)){const skill=({medicine:'医学',music:'乐曲',wit:'诗书',social:'女红'})[tag];game.reputation=clamp(game.reputation+(game.skills[skill]>=5?3:1));}
    else game[tag==='prestige'?'prestige':'reputation']=clamp(game[tag==='prestige'?'prestige':'reputation']+(bold?3:1));
  }
  function randomCourtTale(){
    if(game.storyHistory.length>=courtTales.length)game.storyHistory=[];
    const available=courtTales.map((t,i)=>({t,i})).filter(({i})=>!game.storyHistory.includes(i));const {t,i}=pick(available);game.storyHistory.push(i);
    openModal(t[0],t[1],[{label:t[2],run:()=>{taleReward(t[6],true);finishPlot(t[3]);}},{label:t[4],run:()=>{taleReward(t[6],false);finishPlot(t[5]);}}],'岁时与宫闱');
  }
  const emperorScenes={
    '温柔':[['御苑分花','陛下亲手剪下数枝海棠，命人送往各宫。你注意到他记得每个人不同的喜好。','为宫人也留一枝','陛下说花开不应只供御前，命人将余花送到值房。'],['夜灯问安','陛下路过你的宫门，先问守夜宫人是否添了炭火。','请他入内喝一盏热茶','他接过茶盏，与你说起今日朝堂之外的琐事。'],['长廊春雨','春雨忽至，陛下命人给每个赴宴的人送伞。','替晚归的宫人领伞','陛下看见你折回去，微笑着让内侍多备几把。']],
    '腹黑':[['一局无声','陛下摆下残局，却故意不说明谁执黑子。','先问此局为谁而下','他抬眼一笑，说你终于看见了棋盘之外的人。'],['御前试探','陛下将两份互相矛盾的宫人证词交给你。','先看证据，不急站队','他收回证词，说今夜不过想听你如何辨人。'],['笑里藏锋','陛下听说六宫有人借礼品争宠，反问你谁更聪明。','说守住分寸的人走得更远','他没有表态，只命人记下你这句话。']],
    '冷漠':[['故人旧曲','一段旧曲从御书房传出，陛下独自听了许久。','安静听完，不追问来历','曲终时，他让人将乐谱送到你宫中。'],['雪落空庭','陛下在空庭看雪，随侍宫人无人敢出声。','把手炉交给内侍便退下','他没有留你，却在次日遣人送来一枝白梅。'],['无字家书','御案上留着一封没有展开的旧信。陛下问你人是否都该回头。','说有些事可以记住而不重来','他沉默很久，将旧信重新收进了匣中。']],
    '邪恶':[['赏罚之间','陛下让你决定犯错宫人的处置，似乎只想看你如何为难。','按宫规陈明轻重','他漫不经心地改了处置，却记住了你坚持的理由。'],['碎玉之声','一只玉盏被摔在阶前，陛下问满殿的人谁该担责。','把经过如实说清','他不再追问，转身时的神色仍让人难以捉摸。'],['猎场余影','陛下兴起，问你可敢看他如何驯服一匹烈马。','请驯马者先检查鞍辔','他笑说你扫兴，却仍让人重新查了一遍。']],
    '风流':[['桃花新词','陛下带来一首新词，声称是今晨忽然想起你。','接下一句，也问他写过几首','他大笑，将未写完的词交给你收尾。'],['画扇留香','一柄新画的团扇被送到御前，陛下请你题字。','写一行不求长久的诗','他把诗念了两遍，兴致又转向席间的新曲。'],['水榭听歌','水榭中歌声四起，陛下邀你点评今夜的曲目。','说出自己最喜欢的一段','他命乐师重奏那一段，留你再听了一回。']]
  };
  emperorPlot=function(){const scenes=emperorScenes[game.emperorType];game.emperorStoryIndex ??=0;const s=scenes[game.emperorStoryIndex++%scenes.length];openModal(s[0],s[1],[{label:s[2],run:()=>{heartChange('good',4,true);gainFavor(.5);finishPlot(s[3]);}},{label:'依礼告退',run:()=>{game.reputation=clamp(game.reputation+1);finishPlot('你行礼告退，没有急着猜透帝王此刻的心意。');}}],'帝王心事');};
  const v6MonthEvent=monthlyEvent;
  monthlyEvent=function(){const n=rand(1,100);if(n<=40)randomCourtTale();else if(n<=65)emperorPlot();else v6MonthEvent();};
  const v6Month=monthlyTick;
  monthlyTick=function(m){v6Month(m);if(!game.ended&&(game.month%6===0||game.crownPrinceId&&!royalSons().some(s=>s.c.id===game.crownPrinceId)))crownDecision();};
  const v6Start=startGame;
  startGame=function(){v6Start();crownDecision();renderGame();saveGame('auto');};
  const v7Restore=restore;
  restore=function(data){v7Restore(data);renderLog();};
  const v6Hidden=revealHiddenValues;
  revealHiddenValues=function(){v6Hidden();$('cheatReport').insertAdjacentHTML('beforeend','<br><b>侍寝进度</b><br>'+[game,...game.court].map(p=>`${escapeHtml(p.name)}：${p.intimacyProgress}/100，侍寝后重置为${intimacyReset[Math.max(0,rankTier(p.rank))]}`).join('<br>'));};
  function princePortrait(c){const age=(c.ageMonths||0)/12;const col=age<3?0:age<10?1:age<16?2:3;return `<div class="royal-art" role="img" aria-label="${escapeHtml(c.name)}的${['婴幼儿','儿童','少年','成年'][col]}立绘" style="background-position:${col*100/3}% 100%"></div>`;}
  const v6Offspring=offspringRender;
  offspringRender=function(){v6Offspring();const sons=royalSons();$('offspringList').insertAdjacentHTML('afterbegin',sons.map(({c,m})=>`<div class="prince-card ${c.id===game.crownPrinceId?'crown-card':''}">${princePortrait(c)}<div><b>${escapeHtml(c.name)} · ${c.id===game.crownPrinceId?'皇太子':'皇子'}</b><small>${Math.floor(c.ageMonths/12)}岁 · 生母${escapeHtml(m.name)}<br>学业${c.learning||0} · 品行${c.merit}</small></div></div>`).join(''));};
  const v6Render=renderGame;
  renderGame=function(){v6Render();if(!game)return;document.body.classList.add('in-palace');$('crownStatus').textContent='东宫：'+(royalSons().find(s=>s.c.id===game.crownPrinceId)?.c.name||'尚未立储');};
  const v6Act=act;
  act=function(kind){if(kind==='crown'){if(game&&!game.ended&&!game.acted)crownMenu();}else v6Act(kind);};
  const crownButton=document.createElement('button');crownButton.className='action-card';crownButton.innerHTML='<b>东宫议储</b><small>立储规则与奏请</small>';crownButton.onclick=()=>act('crown');document.querySelector('.action-grid').append(crownButton);
  // Keep all actions beside the story, and put reference panels in a tabbed drawer.
  const drawer=document.createElement('section');drawer.className='info-drawer hidden';drawer.id='infoDrawer';drawer.innerHTML='<header><b>禁中簿册</b><button id="closeInfo" class="subtle-btn">关闭 ×</button></header><nav id="infoTabs"></nav><div id="infoContent"></div>';document.body.append(drawer);
  const panels=[['命簿',document.querySelector('.left-column')],['人物',document.querySelector('.right-column')],['地图',document.querySelector('.palace-map-panel')]];
  const ranksPanel=document.createElement('div');document.querySelectorAll('.rank-reference').forEach(el=>ranksPanel.append(el));panels.push(['位分',ranksPanel]);
  const showInfo=name=>{show('infoDrawer');for(const [label,panel]of panels)panel.classList.toggle('hidden',label!==name);};
  for(const [label,panel]of panels){$('infoContent').append(panel);panel.classList.add('hidden');const b=document.createElement('button');b.className='subtle-btn';b.textContent=label;b.onclick=()=>showInfo(label);$('infoTabs').append(b);}
  $('closeInfo').onclick=()=>hide('infoDrawer');
  const toolbar=document.createElement('nav');toolbar.className='game-toolbar';toolbar.innerHTML='<span id="crownStatus">东宫：尚未立储</span>';
  for(const [label]of panels){const b=document.createElement('button');b.className='subtle-btn';b.textContent=label==='命簿'?'我的命簿':label+'簿';b.onclick=()=>showInfo(label);toolbar.append(b);}document.querySelector('.game-heading').after(toolbar);
  const rail=document.createElement('aside');rail.className='action-rail';rail.append(document.querySelector('.actions-panel'));document.querySelector('.dashboard').append(rail);
  // Remove duplicate action shortcuts, keeping each available action in one place.
  const seenActions=new Set();document.querySelectorAll('.action-grid .action-card').forEach(b=>{const key=b.querySelector('b')?.textContent;if(seenActions.has(key))b.remove();else seenActions.add(key);});

  portrait=function(seed){const col=Math.abs(seed)%4;return `<div class="consort-art" role="img" aria-label="古风彩绘宫装立绘" style="background-position:${col*100/3}% 0%"></div>`;};
  const v7World=initializeWorld;
  initializeWorld=function(){v7World();game.nextArtIndex ??=0;for(const p of [game,...game.court]){p.artIndex ??=game.nextArtIndex++%8;for(const c of p.children)c.artVariant ??=rand(0,9999);}};
  function characterPortrait(p){if(game.specialEnding&&p===game)return '<div class="special-person-art" role="img" aria-label="李坤峰专属唐风Q版立绘"></div>';const n=p.artIndex||0;return `<div class="full-consort-art" role="img" aria-label="${escapeHtml(p.name)}的完整古风立绘" style="background-position:${n%4*100/3}% ${n<4?0:100}%"></div>`;}
  princePortrait=function(c){const age=(c.ageMonths||0)/12;const col=age<3?0:age<10?1:age<16?2:3;return `<div class="child-growth-art" role="img" aria-label="${escapeHtml(c.name)}的${['婴幼儿','儿童','少年','成年'][col]}${c.gender}立绘" style="background-position:${col*100/3}% ${c.gender==='皇子'?0:100}%;filter:hue-rotate(${(c.artVariant||0)%5*4-8}deg)"></div>`;};
  offspringRender=function(){
    const rows=[...game.children.map(c=>({c,m:game})),...game.court.flatMap(m=>m.children.map(c=>({c,m})))];
    $('offspringCount').textContent=rows.filter(({c})=>!c.dead).length;
    $('offspringList').innerHTML=(game.pregnancy?`<div class="pregnancy-status">你正在养胎，预计${game.pregnancy.months}个月后临盆。</div>`:'')+rows.map(({c,m})=>`<article class="child-full-card ${c.dead?'deceased':''} ${c.id===game.crownPrinceId?'crown-card':''}">${princePortrait(c)}<div><b>${escapeHtml(c.name)} · ${c.id===game.crownPrinceId?'皇太子':c.gender}${c.dead?' · 已故':''}</b><p>${Math.floor((c.ageMonths||0)/12)}岁${(c.ageMonths||0)%12}月 · ${c.temperament}<br>生母：${escapeHtml(m.name)}<br>学业${c.learning||0} · 品行${c.merit||0} · 健康${c.health||0}</p><small>${c.nurseStats?escapeHtml(staffText(c.nurseStats)):'乳母待选'}<br>${c.teacherStats?escapeHtml(staffText(c.teacherStats)):'老师待选'}</small></div></article>`).join('')+(rows.length?'':'<p class="empty-note">尚无皇嗣消息</p>');
  };
  const narrativeDetails={
    '灯市遗簪':'上元灯市才散，值夜宫人便在廊下捡到一枚金簪。簪头镶着细碎的红宝石，断开的缠线像是刚从发髻上滑落。来报的人压低声音，说有宫人愿意作证，认定它出自另一位妃嫔。可灯市人来人往，一句未经核验的话，足以让一桩失物变成见不得人的密会。',
    '秋猎惊马':'秋猎归途的风里还带着草木的凉意，一匹御马忽然扬蹄，吓得旁边的宫人连连后退。侍卫很快拉住缰绳，席间却已有人指着养马的小内侍，说他怠慢御驾。你看见鞍辔上一截松开的绳结，也记得方才是谁经过马厩。眼前的混乱还没有结束，责罚的归属却似乎已经有人替它写好。',
    '花宴换帖':'花宴设在水榭，岸边的海棠开得正盛。你接过宫人呈来的座次帖，发现自己的名字被挪到不合位分的位置，原处还留着一层没有干透的新墨。几位妃嫔已经望过来，等你发怒，也等你退让。你知道这张小小的纸帖既关乎礼数，也可能是有人试探你的第一步。',
    '雪夜旧袍':'夜雪压弯了宫门前的竹枝，守门宫人搓着手，旧袍的袖口已经磨得发白。内廷的冬衣例本该在月初发齐，她却不敢向管事多问，只说自己不冷。你往值房里看去，角落的炭盆也只剩一点暗红。若不追问账目，这一夜的寒冷也许会在别的宫门口继续下去。',
    '梅枝入画':'画师将素绢铺在窗前，案上插着一枝刚折的红梅。六宫的小像都要送到御前，宫人问你是否在画旁留一句题诗。你望着尚未落笔的空白，忽然觉得它像入宫以来未曾说出口的话。题得太满，容易显得急于邀宠；一字不留，又怕自己的心思永远无人看见。',
    '端午香囊':'端午席上，五色丝线缠着香囊，草木清气随着衣袖散开。一位妃嫔忽然笑说，你用的香材似乎不该出现在宫里。话音很轻，旁边的人却都安静下来，连递茶的宫人也停了半步。你的香方明明记在册中，可一旦被扣上禁香的名目，往后的解释便会变得艰难。',
    '莲池旧誓':'莲叶上的露水还没有散，两位宫女在池边轻声说话。年满出宫的那一个将旧帕子折了又折，说起家乡时笑着，眼眶却渐渐红了。另一个替她系好行囊，反复叮嘱宫门外的路。你没有立刻出声，只在不远处站了一会儿，听见那些在宫册里不会被写下的牵挂。',
    '贡锦争端':'新贡的锦缎堆在尚功局的长案上，日光一照，绣纹像水一样流动。几宫的宫人各执一份领用单，争说自己的主子早已得了口谕。管事不敢得罪任何一边，只把账本往怀里藏。你来得恰巧，众人一齐望向你，既盼你断得公允，也有人等着将偏心二字安到你头上。',
    '夜雨疑踪':'雨点敲着宫墙，一名内侍贴着廊影匆匆走过，转角处落下一枚半旧的令牌。守门宫人将它送来时，掌心还带着雨水。牌上的字迹被磨去一角，既像修缮用的通行凭信，又与平日所见略有不同。深宫里的人总爱从半件小物猜出一整场阴谋，你却还没有足够的证据。',
    '中秋家书':'中秋前一日，家书终于经过宫门查验送到案上。纸页间夹着一片干桂叶，轻轻一碰便有细碎的香气。家中只写了院墙重修、今年桂花开得晚，却没有问你过得好不好，仿佛怕一问，便让这封信多出不该有的重量。窗外已经有人挂起节灯，你低头将桂叶拢进掌心。',
    '梨园争曲':'梨园排练的新曲正到收尾，席间却有人说，你私下改过乐谱，好让御前听见不同于旁人的旋律。几位乐师互望一眼，不敢立刻接话。你记得谱上那处换拍的缘由，也知道一场关于技艺的争论，转眼就能被说成不守规矩的邀宠。案旁的琴弦仍在轻轻发颤。',
    '春蚕开箔':'尚功局的蚕房温暖得像另一个季节，桑叶的清气混着木架的旧香。今日开箔，几位妃嫔都来观礼，你被请到最前面。熟悉蚕事的妇人正等着示范，身后的目光却已经落在你的衣袖和步子上。你忽然明白，宫中的一场仪式从不只看是否做成，也在看人如何站在众人眼前。',
    '空匣疑云':'送往太医院的药匣刚开，掌事便发现少了一味药。送匣的小宫人脸色发白，攥着领药单说自己从未离开过宫道。匣角的封纸看不出撕开的痕迹，可名册上的数量也没有写错。此刻急需用药的病人还在等，你必须先决定，是把时间花在查人上，还是先补齐药材。',
    '镜台流言':'旧铜镜被搬出库房时，背板里滑出一张褪色字条。宫人只认出其中几个不祥的字，半日不到，传闻便变成了有人暗行诅咒。你接过纸片，看见边缘还有被虫蛀过的小孔，墨色也远比传言陈旧。恐惧已经跑在事实前面，连值夜的宫人也开始不敢独自走过那条长廊。',
    '荷灯漂远':'七夕的水面浮着零星灯火，一盏没有落款的荷灯停在石阶旁。纸上写着想回家，并没有祈求金玉或圣眷。你蹲下身，灯焰将指尖映得暖红，远处宴席上的笑声隔着水传来。你不知道是谁放了这盏灯，只知道若执意追问，那个小小的愿望也许会变成需要解释的过错。',
    '密约换盟':'不同阵营的一位妃嫔约你在偏亭说话，连侍女都留在数步之外。她说自己手里有一桩足以让别人失宠的秘密，若你愿意结盟，便可先听一半。亭外的风吹动珠帘，她的声音始终平稳。你分不清这是诚意、试探，还是一封被折成了邀约模样的战书。',
    '假传口谕':'来人站在宫门外，语气比平日严厉，开口便说奉御前口谕取走账册。你的掌事请他出示凭信，他却只催着说不可耽搁圣意。夜色已深，账册一旦离宫，里面能多出什么、少掉什么，便再难说清。你看着他空空的腰间，决定不能只因御前二字便交出一宫的证据。',
    '药材调包':'乳母捧着药包走到炉边时，你闻见一丝不熟悉的气味。纸包上的字迹与领药册相似，封口却多缠了一层线。送药的人站在门旁，不住提醒不可误了时辰。孩子正在内室安睡，你望着那只还没有点起的药炉，意识到今夜的谨慎可能比任何事后的追查都更有用。',
    '私印风波':'诬告信被放到案前时，最刺眼的不是那些指控，而是落款旁与你宫印相似的红痕。围在门边的宫人低下头，谁也不敢说话。你将信挪到灯下，仔细看见印角有一处不合旧样的笔画。有人以为照着轮廓刻一枚印，就能替你说出从未说过的话。',
    '盟中反间':'近日来往的盟友忽然少了，连约好送来的茶帖也迟迟未到。你让人问起，才知道宫中传着你将另投高枝的消息，甚至有人能说出一场从未发生的密谈。昔日一句随意的玩笑，如今被拆开重组，变成旁人眼里的证据。你必须想清楚，要解释给谁听，又有谁愿意听完。',
    '被换的贺礼':'寿宴将开，你亲自挑选的贺礼却在礼匣里变成一件裂了边的旧器。掌事的指尖停在匣沿，脸色一下变白，外头催交礼单的宫人已等了两回。原来的礼物明明在昨日核过，你也记得自己压在匣底的那页清单。比起礼物的贵贱，更难解释的是御前会怎样看待这份突如其来的怠慢。',
    '借刀之计':'所谓铁证被包在一封没有署名的书信里，递信的人说，只要你今日在御前开口，便能让那位受宠妃嫔再难翻身。证词写得很满，连哭诉的措辞都像事先排好。你逐行看下去，却发现两个相距甚远的地方竟写着同一个时辰。有人想借你的声音，把自己的手藏得干干净净。'
  };
  const sceneAftermath={
    '假传口谕':'宫门重新落锁时，掌事将账册一卷卷点回原处。你让她把今夜来人的时辰、衣色与传话内容另记一页；在宫中，保住原本的事实，有时就已经是最难的一步。',
    '药材调包':'那包药没有进炉。乳母替孩子掖好被角，才发觉自己的手一直在抖。你将值夜与领药的名册重新排过，明白躲过这一回，还远不等于从此可以高枕无忧。',
    '被换的贺礼':'礼匣再次合上时，你亲手压好了交接单。席间仍旧笙歌不断，几乎没有人知道，一场足以改变宫中人情的风波，刚在这道门内被悄悄挡住。',
    '盟中反间':'解释并不能让每个人立刻放下戒心。你没有催问谁信、谁不信，只把下一次约好的往来如期办完。日后回想起来，真正留下盟友的，往往是那些没有失约的小事。',
    '中秋家书':'夜深后，宫人将灯罩拢好，月色依旧落在窗纸上。你又读了一遍信末那句平安，才将纸页细细折回。宫墙之外有人惦念的感觉，比一桌节宴更让人安定。',
    '灯市遗簪':'金簪的来路终于有了能够核对的记录。你没有急着打听是谁最先说出那句指控，只让掌事记住，以后再遇到类似的事，先留物证，再传人言。',
    '雪夜旧袍':'等宫道上的雪被扫开，值房里终于生起了新火。宫人行礼道谢时，你才看清她冻红的手指。那一点暖意很小，却足够让这个漫长的冬夜不再只剩忍耐。',
    '私印风波':'灯烛快燃到底时，比对的印样仍铺在案上。你不再只靠记忆辨认这些细微的差别，而是命人把旧印留档、收信记时。宫中的体面之外，也需要一套能护住人的规矩。'
  };
  Object.assign(narrativeDetails,{
    '御花园惊变':'太液池边的柳枝刚抽新芽，水面忽然传来一声短促的呼救。你循声望去，一个宫女正攀着湿滑的石沿，衣袖已经浸透。岸边几位妃嫔惊得退开，随侍宫人互相望着，谁也不敢擅自下水。风把呼救声吹得断断续续，你知道再多等一会儿，今日这场意外就可能变成无人敢提的旧事。',
    '中宫问账':'皇后将冬衣账册摊在案前，示意你坐到灯下。账面上几宫领取的件数与库房出库记录对不上，有些笔迹还像是后来补写。她没有指名怀疑谁，只问你可愿协助核对。帘外的内侍低着头，你却感觉到那些没有说出口的目光都落在你的笔尖：查清可以立威，查得太深，也可能让你多出一个敌人。',
    '妃嫔生辰宴':'生辰宴的水晶帘被风轻轻拂动，案上果碟和酒盏都按礼摆好。设宴的妃嫔笑着请你入座，话题从新送的锦缎说到御前赏赐，每一句都似乎只是闲谈。旁人却不时望向你的贺礼，等你怎样回应那盏递过来的酒。你知道这场小宴既可以是一段交情的开头，也可以变成日后被反复转述的一个失仪。',
    '迟来的家书':'家书本该在数日前送到，你的掌事却在宫门跑了几趟都没有领回。管文书的内侍只说还需查验，问起缺什么手续，又答得含糊。你记得家中每逢换季总爱报一声平安，等得越久，心中便越不安。今日有宫人悄悄提醒，也许不是宫门事忙，而是有人想看看你会为了这封信向谁低头。',
    '御前玉佩失窃':'来问话的内侍没有落座，先将一张御前用物清单放到案上。那枚旧玉佩不见了，而你宫中的侍女昨夜恰好从附近经过。侍女站在门边，脸色白得像纸，急着说自己只是奉命送还灯罩。你知道若不把时辰与去向说清，一次偶然经过很快就会在别人口中变成处心积虑的证据。',
    '冬夜求药':'求药的宫人进门时，鞋边还结着薄薄的霜。另一宫的妃嫔忽然病倒，太医急需的一味药材在库房暂缺，她听说你宫中尚有留存，便遣人前来相求。你望向架上那只封好的药匣，也想起近日双方不冷不热的往来。送药或许能换一段善缘，可一旦药方出了差错，谁又说得清之后的责任。',
    '上元灯会':'宫道上挂满了新灯，水面映着流动的红与金。麟德殿的席间，陛下命六宫各献一艺，乐师已经将琴案与纸笔摆在帘前。几位妃嫔早有准备，含笑推让的言语里藏着不肯落后的心思。你看见御座前留出的一小片空地，知道走上去时，平日的练习与生疏都会被众人看得清清楚楚。',
    '流言回到耳边':'传言最初只是一句关于赏赐的闲话，等传到中宫，已多了几次没有发生过的密会。掌事替你整理衣领时欲言又止，门边送水的宫女也比平日安静。你未曾改变的行止，在别人口中却已有了完全不同的含义。此刻是把事实一一说开，还是等待风声自行散去，都可能改变皇后往后看你的目光。',
    '册封前夕':'册封的风声还没有正式传出，几宫的礼单却已悄悄添了新名目。宫人来往时说话比平日更轻，似乎每个人都听见了不同版本的口谕。协理六宫者约你前去说话，没有提晋位，却特意让人备好你常用的茶。你明白这时的一次走访、一句承诺，都可能被旁人当作早已站好的位置。'
  });
  let lastNarrativeTitle='';
  const v7Modal=openModal;
  openModal=function(title,text,choices,eyebrow){
    lastNarrativeTitle=title;
    let expanded=narrativeDetails[title]||text;
    if(!narrativeDetails[title]&&eyebrow==='帝王心事'){
      const atmosphere={温柔:'他没有催你回答，先让内侍把冷掉的茶撤去。御前的威仪在此刻淡了些，露出一个也会留意旁人冷暖的人。',腹黑:'他说得像一句闲话，视线却始终落在你脸上。案边的灯火照不到眼底，你知道自己说出的每个字都可能被记住。',冷漠:'殿内只有更漏的细响，随侍的人都退到了帘外。他不习惯解释，也没有给出任何暗示，留给你的只有这一刻罕见的靠近。',邪恶:'他唇边似乎带着笑，阶下的人却无人敢跟着笑。你分不清他真正想听的是道理，还是看别人如何在他的兴致里失去分寸。',风流:'花香与新曲一同飘进水榭，他的心思像风一样，前一刻还停在词句上，下一刻便转向你的眉眼。你知道此刻的热切是真的，却猜不到它能停留多久。'};
      expanded=text+'\n\n'+atmosphere[game.emperorType];
    }
    v7Modal(title,expanded,choices.map(c=>({...c,run:()=>{lastNarrativeTitle=title;c.run();}})),eyebrow);
  };
  const v7FinishPlot=finishPlot;
  finishPlot=function(text){const after=sceneAftermath[lastNarrativeTitle];v7FinishPlot(after?text+'\n\n'+after:text);};
  const happyEnding=[
    '宫门前的春风还没有吹散，选秀的名册才翻到“李坤峰”三个字，御座上的韩佳璇便抬起了头。她看了他一眼，又认真看了一眼，最后将手里的朱笔搁下，连装作镇定都省了：“不必往下念了。”满殿宫人垂首不语，只有李坤峰扶了扶眼镜，明明已经笑起来，还故作端正地向她行礼。',
    '这一回，命簿没有卖关子。圣眷一百，真心也是一百。韩佳璇当日便下诏罢黜六宫，妥善安置原有宫眷，任她们择愿归家或另居别院。朝臣奉劝她再留余地，她只说：“江山可以慢慢治，喜欢的人不能叫他慢慢等。”从此，偌大的宫城有了一个人人都知道、却没有人敢打趣得太大声的秘密：陛下的一颗心，开局便全给了李坤峰。',
    '李坤峰搬进承华宫时，原想规规矩矩选一间书房。韩佳璇亲自过来看，挑来挑去，却把他的书案挪到了自己案边。她说是方便问学，他说那他是不是该按时交功课；两个人一本正经地商量了半晌，最后谁也没把笑藏住。此后御前多了一只茶盏、一副备用眼镜，还有一个别人不能随意坐的位置。',
    '春日里，两个人喜欢趁宫人换班时去御花园。李坤峰替她举着团扇遮太阳，她偏要把步子放慢，等他回头便伸手牵住他的袖口。有时她故意问“昭宁君今日怎么不来请安”，他便当真站定，郑重其事地行一礼，再凑过去轻轻亲一下她的额头。韩佳璇红着耳尖，说他越来越不守规矩，手却一直没有松开。',
    '夏夜的书房总留一盏灯。韩佳璇看奏疏看得累了，就将额头抵在李坤峰肩上；他替她把散下来的发丝理好，一边念自己新抄来的笑话。她起初还提醒他“御前不许胡闹”，听到一半又忍不住笑，连朱笔都拿不稳。宫人远远送来一碟冰酪，见两个人挨着坐，便只放下托盘，默契地将帘子轻轻垂好。',
    '到了冬天，他们又学会了理直气壮地赖一小会儿床。窗外雪落得很轻，李坤峰总说再等一盏茶，韩佳璇总答应只许半盏；等宫人来催第三回，两个人才笑着坐起来。她替他系衣带，他替她挑簪子，挑得不好还要互相逗两句。该上朝时照旧上朝，该办的事也不耽误，只是那些原本冰冷的宫廷日常，从此都添了一个可以一起笑的人。',
    '他们也不是从来不闹别扭。偶尔一盘棋下得认真，或是谁忘了答应好的点心，便各自端着架子，谁也不肯先开口。可没过多久，李坤峰就会借口添茶坐回她身边，韩佳璇也会把早留好的那块甜糕推过去。两个人还要装作只是顺手，眼神却早已将和好的话说完。',
    '许多年后，起居注写过她如何理政，也写过他如何伴驾；宫人记得他们一起看过的灯、赏过的雪，却没人能数清那些藏在袖口里的牵手，和无人时偷偷交换的亲吻。李坤峰与韩佳璇就这样幸福又“没羞没臊”地生活在一起：在人前端得住礼数，在彼此面前却永远舍不得收起那一点孩子气。此生不必再争圣眷，因为从第一眼起，真心便已经到达了终点。'
  ];
  const v7Start=startGame;
  startGame=function(){
    const special=$('playerName').value.trim()==='李坤峰';v7Start();if(!special)return;
    clearTimeout(autoTimer);autoTimer=null;hide('choiceModal');
    game.specialEnding=true;game.name='李坤峰';game.family=game.family.replace('之女','之家');game.stats.fertility=0;game.age=24;game.emperorName='韩佳璇';game.emperorAge=24;game.emperorType='温柔';game.favor=100;game.trueHeart=100;game.favorRevealed=true;game.rank='贵妃';game.acted=false;
    game.log=[];game.ended=false;heartThresholds();game.ended=true;game.endingTitle='江山与你 · 一眼到白头';game.endingParagraphs=happyEnding;game.dismissedFor='player';
    game.court.forEach(p=>{p.banished=true;p.authority=false;});
    $('welcomeTitle').textContent='李坤峰与韩佳璇 · 专属终章';renderGame();renderLog();saveGame('auto');
  };
  const v7Log=renderLog;
  renderLog=function(){
    if(!game?.specialEnding)return v7Log();
    $('storyLog').innerHTML=`<section class="special-ending"><p class="ending-eyebrow">专属彩蛋 · 终章已达成</p><h2>${escapeHtml(game.endingTitle||'江山与你')}</h2><img src="assets/betty-kunfeng-tang.png" alt="李坤峰与韩佳璇专属唐风Q版合绘"><div class="ending-stats"><span>李坤峰 · 24岁</span><span>女帝韩佳璇 · 24岁</span><span>圣眷100 · 真心100</span></div>${(game.endingParagraphs||happyEnding).map(p=>`<p>${escapeHtml(p)}</p>`).join('')}<p class="ending-seal">此生唯一，来日方长。<br>—— 全剧终 ——</p></section>`;
    $('storyLog').scrollTop=0;
  };
  const v7Render=renderGame;
  renderGame=function(){v7Render();document.body.classList.toggle('special-ending-mode',Boolean(game?.specialEnding));if(game?.specialEnding){$('profileRank').textContent='昭宁君 · 此生唯一';$('storyDate').textContent='女帝韩佳璇 · 江山与你';$('crownStatus').textContent='专属终章 · 已罢黜六宫';$('saveStatus').textContent='一眼到白头';renderLog();}};
  const archiveBackdrop=document.createElement('div');archiveBackdrop.className='archive-backdrop hidden';archiveBackdrop.id='archiveBackdrop';document.body.append(archiveBackdrop);
  const v7Show=show,v7Hide=hide;
  show=function(id){v7Show(id);if(id==='infoDrawer')v7Show('archiveBackdrop');};
  hide=function(id){v7Hide(id);if(id==='infoDrawer')v7Hide('archiveBackdrop');};
  archiveBackdrop.onclick=()=>hide('infoDrawer');
  $('infoDrawer').addEventListener('click',e=>{if(e.target===$('infoDrawer')||e.target===$('infoContent'))hide('infoDrawer');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide('infoDrawer');});

  $("beginBtn").addEventListener("click", () => {
    setup = makeSetup(); renderSetup(); hide("introScreen"); show("setupScreen");
  });
  $("enterBtn").addEventListener("click", startGame);
  $("randomName").addEventListener("click", () => { $("playerName").value = randomName(); });
  $("nextTurn").addEventListener("click", advanceRound);
  $("closeModal").addEventListener("click", () => hide("choiceModal"));
  $("choiceModal").addEventListener("click", (event) => { if (event.target.id === "choiceModal") hide("choiceModal"); });
  document.querySelectorAll(".action-card").forEach((button) => button.addEventListener("click", () => act(button.dataset.action)));
  $("courtList").addEventListener("click", (event) => {
    const element = event.target.closest(".court-person");
    if (!element || !game) return;
    const person = game.court.find((item) => item.id === element.dataset.person);
    if (!person) return;
    showToast(`${person.name} · ${person.rank} · ${person.role} · 关系${game.relations[person.id] || 0}`);
  });
  $("soundToggle").addEventListener("click", () => showToast("此版本暂无背景音效"));
})();

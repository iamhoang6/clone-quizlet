/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║          QUIZLET CLONE PRO — Nâng cấp toàn diện         ║
 * ║  Tính năng: Multi-format | Preview | Dedup | Progress   ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  © Script được phát triển bởi                           ║
 * ║     Nguyễn Tiến Việt Hoàng                              ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * CÁCH DÙNG:
 *  1. Mở bộ thẻ Quizlet muốn clone (trang /flashcards hoặc /set)
 *  2. Mở DevTools → Console (F12)
 *  3. Paste toàn bộ script này và nhấn Enter
 *  4. Cửa sổ Preview sẽ hiện ra, chọn format và tải về
 */

(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ─── INJECT STYLES ───────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #qz-overlay {
      position: fixed; inset: 0; z-index: 999999;
      background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, 'Segoe UI', sans-serif;
    }
    #qz-box {
      background: #fff; border-radius: 16px; padding: 28px 32px;
      width: 480px; max-width: 94vw; box-shadow: 0 24px 60px rgba(0,0,0,.2);
      max-height: 88vh; display: flex; flex-direction: column;
    }
    #qz-box h2 { margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #1a1a2e; }
    #qz-box p  { margin: 0 0 16px; font-size: 13px; color: #666; }
    #qz-progress-bar-wrap {
      height: 6px; background: #eee; border-radius: 99px; overflow: hidden; margin-bottom: 8px;
    }
    #qz-progress-bar { height: 100%; width: 0%; background: #4255ff; border-radius: 99px; transition: width .3s; }
    #qz-status { font-size: 12px; color: #888; margin-bottom: 16px; min-height: 16px; }
    #qz-preview {
      flex: 1; overflow-y: auto; border: 1px solid #e8e8e8; border-radius: 8px;
      margin-bottom: 16px; max-height: 240px;
    }
    #qz-preview table { width: 100%; border-collapse: collapse; font-size: 13px; }
    #qz-preview th {
      position: sticky; top: 0; background: #f7f8ff;
      padding: 8px 12px; text-align: left; font-weight: 600;
      color: #4255ff; border-bottom: 1px solid #e8e8e8;
    }
    #qz-preview td { padding: 7px 12px; border-bottom: 1px solid #f2f2f2; color: #333; }
    #qz-preview tr:last-child td { border-bottom: none; }
    #qz-preview tr:hover td { background: #f9f9ff; }
    #qz-badge {
      display: inline-block; background: #eef0ff; color: #4255ff;
      font-size: 11px; font-weight: 600; padding: 2px 8px;
      border-radius: 99px; margin-left: 8px; vertical-align: middle;
    }
    #qz-dup-badge {
      display: none; background: #fff3e0; color: #e65100;
      font-size: 11px; font-weight: 600; padding: 2px 8px;
      border-radius: 99px; margin-left: 4px; vertical-align: middle;
    }
    .qz-fmt-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .qz-fmt-btn {
      flex: 1; min-width: 80px; padding: 9px 12px; border: 1.5px solid #ddd;
      border-radius: 8px; background: #fff; cursor: pointer;
      font-size: 13px; font-weight: 500; color: #444; transition: all .15s;
    }
    .qz-fmt-btn:hover { border-color: #4255ff; color: #4255ff; background: #f0f1ff; }
    .qz-fmt-btn.active { border-color: #4255ff; background: #4255ff; color: #fff; }
    .qz-action-row { display: flex; gap: 10px; }
    #qz-btn-dl {
      flex: 1; padding: 11px; border: none; border-radius: 8px;
      background: #4255ff; color: #fff; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: background .15s;
    }
    #qz-btn-dl:hover { background: #3344ee; }
    #qz-btn-copy {
      padding: 11px 16px; border: 1.5px solid #ddd; border-radius: 8px;
      background: #fff; color: #444; font-size: 14px; cursor: pointer;
      transition: all .15s;
    }
    #qz-btn-copy:hover { border-color: #4255ff; color: #4255ff; }
    #qz-btn-close {
      padding: 11px 16px; border: 1.5px solid #ddd; border-radius: 8px;
      background: #fff; color: #666; font-size: 14px; cursor: pointer;
    }
    #qz-btn-close:hover { background: #fafafa; }
    .qz-sep { height: 1px; background: #f0f0f0; margin: 16px 0; }
    #qz-anki-tip {
      display: none; font-size: 11px; color: #888;
      background: #f7f8ff; border-radius: 6px; padding: 8px 10px;
      margin-top: 10px; line-height: 1.5;
    }
  `;
  document.head.appendChild(style);

  // ─── SELECTORS — thử nhiều phiên bản DOM của Quizlet ─────────
  const SELECTORS = [
    // Quizlet 2024-2025 (phiên bản hiện tại)
    {
      container: '.SetPageTermsList-term',
      sides: '[data-testid="set-page-term-card-side"]',
    },
    // Fallback: cấu trúc cũ hơn
    {
      container: '.TermText',
      sides: null, // sẽ dùng innerText trực tiếp
    },
    // Fallback 2: card-based
    {
      container: '[class*="FlashcardSet"] [class*="Term"]',
      sides: '[class*="side"]',
    },
  ];

  // ─── PROGRESS OVERLAY ─────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'qz-overlay';
  overlay.innerHTML = `
    <div id="qz-box">
      <h2>⚡ Quizlet Clone Pro</h2>
      <p>Đang tải flashcards, vui lòng đợi...</p>
      <div id="qz-progress-bar-wrap"><div id="qz-progress-bar"></div></div>
      <div id="qz-status">Đang cuộn trang để load toàn bộ thẻ...</div>
    </div>
  `;
  document.body.appendChild(overlay);

  const setStatus = (msg, pct) => {
    document.getElementById('qz-status').textContent = msg;
    if (pct !== undefined)
      document.getElementById('qz-progress-bar').style.width = pct + '%';
  };

  // ─── AUTO SCROLL ──────────────────────────────────────────────
  let lastH = 0, sameCount = 0, scrollTick = 0;
  while (sameCount < 8) {
    window.scrollBy(0, 2500);
    await sleep(280);
    const h = document.body.scrollHeight;
    scrollTick++;
    if (h === lastH) sameCount++;
    else { sameCount = 0; lastH = h; }
    // Progress cuộn: ước tính 0–50%
    const fakePct = Math.min(50, (scrollTick / (scrollTick + 5)) * 50);
    setStatus(`Đang cuộn trang... (${scrollTick} lần)`, fakePct);
  }
  window.scrollTo(0, 0);

  // ─── EXTRACT FLASHCARDS ───────────────────────────────────────
  setStatus('Đang đọc dữ liệu flashcards...', 55);
  await sleep(400);

  let raw = [];

  // Thử từng selector
  for (const sel of SELECTORS) {
    const terms = document.querySelectorAll(sel.container);
    if (!terms.length) continue;

    terms.forEach((term, i) => {
      let question = '', answer = '';
      if (sel.sides) {
        const sides = term.querySelectorAll(sel.sides);
        if (sides.length >= 2) {
          question = sides[0].innerText.trim().replace(/\s+/g, ' ');
          answer   = sides[1].innerText.trim().replace(/\s+/g, ' ');
        }
      } else {
        // Fallback: lấy tất cả text, chia đôi
        const texts = [...term.querySelectorAll('span, p')]
          .map(e => e.innerText.trim()).filter(Boolean);
        if (texts.length >= 2) { question = texts[0]; answer = texts[1]; }
        else { question = term.innerText.trim(); answer = '—'; }
      }
      if (question) raw.push({ question, answer });
    });

    if (raw.length) break; // dùng selector đầu tiên có kết quả
  }

  setStatus('Đang xử lý và làm sạch dữ liệu...', 70);
  await sleep(200);

  // ─── DEDUPLICATION ────────────────────────────────────────────
  const seen = new Set();
  let dupCount = 0;
  const result = [];
  raw.forEach(card => {
    const key = card.question.toLowerCase() + '|||' + card.answer.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ STT: result.length + 1, question: card.question, answer: card.answer });
    } else {
      dupCount++;
    }
  });

  // ─── GET FILENAME ─────────────────────────────────────────────
  const titlePatterns = [
    /Thẻ ghi nhớ:\s*(.*?)\s*\|/,
    /Flashcards:\s*(.*?)\s*\|/,
    /^(.*?)\s*[-|]/,
  ];
  let setName = 'quizlet_flashcards';
  for (const pat of titlePatterns) {
    const m = document.title.match(pat);
    if (m && m[1]) { setName = m[1].trim(); break; }
  }
  const safeFilename = setName.replace(/[^\w\d\-_\u00C0-\u024F\u1E00-\u1EFF]/g, '_').slice(0, 80);

  // ─── EXPORT FUNCTIONS ─────────────────────────────────────────
  const FORMATS = {
    txt: {
      label: '📄 TXT',
      ext: 'txt',
      mime: 'text/plain;charset=utf-8;',
      generate: () => result.map(c => `${c.question} | ${c.answer}`).join('\n'),
    },
    csv: {
      label: '📊 CSV',
      ext: 'csv',
      mime: 'text/csv;charset=utf-8;',
      generate: () => {
        const esc = s => `"${s.replace(/"/g, '""')}"`;
        return 'STT,Question,Answer\n' +
          result.map(c => `${c.STT},${esc(c.question)},${esc(c.answer)}`).join('\n');
      },
    },
    json: {
      label: '🔧 JSON',
      ext: 'json',
      mime: 'application/json;charset=utf-8;',
      generate: () => JSON.stringify({ set: setName, total: result.length, cards: result }, null, 2),
    },
    anki: {
      label: '🧠 Anki',
      ext: 'txt',
      mime: 'text/plain;charset=utf-8;',
      generate: () => result.map(c => `${c.question}\t${c.answer}`).join('\n'),
      tip: 'File này dùng để import vào Anki: File → Import → chọn tab phân cách. Chọn "Front" và "Back" tương ứng.',
    },
    md: {
      label: '📝 Markdown',
      ext: 'md',
      mime: 'text/markdown;charset=utf-8;',
      generate: () => {
        const header = `# ${setName}\n\n> Tổng số thẻ: ${result.length}\n\n| STT | Câu hỏi / Thuật ngữ | Câu trả lời / Định nghĩa |\n|-----|---------------------|-------------------------|\n`;
        return header + result.map(c => `| ${c.STT} | ${c.question} | ${c.answer} |`).join('\n');
      },
    },
  };

  const downloadFile = (content, filename) => {
    const fmt = FORMATS[activeFmt];
    const blob = new Blob([content], { type: fmt.mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ─── BUILD PREVIEW UI ─────────────────────────────────────────
  let activeFmt = 'txt';

  const previewRows = result.slice(0, 50).map((c, i) =>
    `<tr>
      <td style="color:#999;width:36px">${c.STT}</td>
      <td>${c.question.slice(0, 60)}${c.question.length > 60 ? '…' : ''}</td>
      <td style="color:#666">${c.answer.slice(0, 60)}${c.answer.length > 60 ? '…' : ''}</td>
    </tr>`
  ).join('');

  const fmtButtons = Object.entries(FORMATS)
    .map(([key, f]) =>
      `<button class="qz-fmt-btn${key === 'txt' ? ' active' : ''}" data-fmt="${key}">${f.label}</button>`
    ).join('');

  document.getElementById('qz-box').innerHTML = `
    <h2>
      ✅ Quizlet Clone Pro
      <span id="qz-badge">${result.length} thẻ</span>
      <span id="qz-dup-badge">${dupCount > 0 ? dupCount + ' trùng lặp' : ''}</span>
    </h2>
    <p style="margin-bottom:12px;font-size:13px;color:#555">
      <strong>${setName}</strong> — Chọn định dạng và tải về
    </p>

    <div class="qz-fmt-row">${fmtButtons}</div>

    <div id="qz-preview">
      <table>
        <thead><tr><th>#</th><th>Câu hỏi / Thuật ngữ</th><th>Câu trả lời / Định nghĩa</th></tr></thead>
        <tbody>${previewRows}</tbody>
      </table>
      ${result.length > 50 ? `<div style="text-align:center;padding:8px;font-size:12px;color:#aaa">... và ${result.length - 50} thẻ nữa</div>` : ''}
    </div>

    <div id="qz-anki-tip"></div>

    <div class="qz-action-row">
      <button id="qz-btn-dl">⬇ Tải về (.txt)</button>
      <button id="qz-btn-copy" title="Copy vào clipboard">📋</button>
      <button id="qz-btn-close">✕</button>
    </div>

    <div style="margin-top:14px;padding-top:10px;border-top:1px solid #f0f0f0;text-align:center;font-size:11px;color:#bbb;letter-spacing:.3px">
      © Script được phát triển bởi <strong style="color:#999;font-weight:600">Nguyễn Tiến Việt Hoàng</strong>
    </div>
  `;

  if (dupCount > 0) document.getElementById('qz-dup-badge').style.display = 'inline-block';

  // ─── EVENTS ───────────────────────────────────────────────────
  document.querySelectorAll('.qz-fmt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.qz-fmt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFmt = btn.dataset.fmt;
      const fmt = FORMATS[activeFmt];
      document.getElementById('qz-btn-dl').textContent = `⬇ Tải về (.${fmt.ext})`;
      const tipEl = document.getElementById('qz-anki-tip');
      if (fmt.tip) {
        tipEl.textContent = '💡 ' + fmt.tip;
        tipEl.style.display = 'block';
      } else {
        tipEl.style.display = 'none';
      }
    });
  });

  document.getElementById('qz-btn-dl').addEventListener('click', () => {
    const fmt = FORMATS[activeFmt];
    const content = fmt.generate();
    downloadFile(content, `${safeFilename}_flashcards.${fmt.ext}`);
    const btn = document.getElementById('qz-btn-dl');
    btn.textContent = '✅ Đã tải!';
    setTimeout(() => { btn.textContent = `⬇ Tải về (.${fmt.ext})`; }, 2000);
  });

  document.getElementById('qz-btn-copy').addEventListener('click', async () => {
    const fmt = FORMATS[activeFmt];
    const content = fmt.generate();
    try {
      await navigator.clipboard.writeText(content);
      const btn = document.getElementById('qz-btn-copy');
      btn.textContent = '✅';
      setTimeout(() => { btn.textContent = '📋'; }, 1800);
    } catch {
      alert('Không thể copy: trình duyệt chặn clipboard API. Hãy thử tải file.');
    }
  });

  document.getElementById('qz-btn-close').addEventListener('click', () => {
    overlay.remove();
    style.remove();
    // In ra console dưới dạng bảng (bonus)
    console.clear();
    console.log(`%c✅ Quizlet Clone Pro — ${result.length} thẻ đã được trích xuất`, 'color:#4255ff;font-weight:bold;font-size:14px');
    if (dupCount > 0) console.warn(`⚠️ Đã bỏ ${dupCount} thẻ trùng lặp`);
    console.table(result);
  });

  // Đóng khi click ngoài box
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.remove(), style.remove();
  });

  // ─── DONE ─────────────────────────────────────────────────────
  console.log(`%c✅ Quizlet Clone Pro sẵn sàng — ${result.length} thẻ`, 'color:#4255ff;font-weight:bold;font-size:14px');
  console.log(`%c© Script được phát triển bởi Nguyễn Tiến Việt Hoàng`, 'color:#888;font-size:11px;font-style:italic');
  if (!result.length) {
    alert('⚠️ Không tìm thấy flashcard nào!\n\nHãy chắc chắn bạn đang ở trang /flashcards của một bộ thẻ Quizlet.');
  }

})();

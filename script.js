
// Surfacing Calculator logic (based on user's provided formulas)
document.addEventListener('DOMContentLoaded', ()=> {
  const segs = document.querySelectorAll('.seg');
  let lensType = 'minus';
  segs.forEach(s=>{
    s.addEventListener('click', ()=> {
      segs.forEach(x=>x.classList.remove('active'));
      s.classList.add('active');
      lensType = s.dataset.val;
    });
  });
  // set default active
  segs[0].classList.add('active');

  const getVal = id => {
    const el = document.getElementById(id);
    return el && el.value !== '' ? parseFloat(el.value) : null;
  };

  document.getElementById('hitung').addEventListener('click', ()=> {
    // collect inputs
    const sphR = getVal('sphR') || 0;
    const cylR = getVal('cylR') || 0;
    const sphL = getVal('sphL') || 0;
    const cylL = getVal('cylL') || 0;
    const pd = getVal('pd') || 62;
    const A = getVal('A') || 52;
    const B = getVal('B') || 0;
    const DBL = getVal('DBL') || 18;
    const shape = document.getElementById('shape').value;
    const index = parseFloat(document.getElementById('index').value) || 1.49;

    // ED/E
    const ED = (shape === 'bulat') ? A : (A + 2);

    // MBS
    // MBS = (A + DBL) – PD + ED + 2
    const MBS = Math.round((A + DBL) - pd + ED + 2);

    // SE
    const SE_R = sphR + (cylR/2);
    const SE_L = sphL + (cylL/2);

    // BC
    // if cyl present, BC = 1/2 SE + 6 else BC = 1/2 sph + 6
    const BC_R = (cylR !== 0) ? (SE_R/2 + 6) : (sphR/2 + 6);
    const BC_L = (cylL !== 0) ? (SE_L/2 + 6) : (sphL/2 + 6);

    // Tool F1 assume F1 = BC (approximation) and D = sph (power)
    const F1_R = BC_R;
    const F1_L = BC_L;
    const D_R = sphR; const D_L = sphL;
    const F2_R = D_R - F1_R;
    const F2_R_cyl = (sphR + cylR) - F1_R;
    const F2_L = D_L - F1_L;

    // Sagita
    // Sag = D * (diameter_mm^2) / (8000 * (n - 1))
    const sag_R = (D_R !== 0) ? (D_R * (MBS * MBS) / (8000 * (index - 1))) : 0;
    const sag_R_abs = Math.abs(sag_R);
    const D_R_90 = (sphR + cylR) || sphR;
    const sag_R_90 = (D_R_90 !== 0) ? (D_R_90 * (MBS * MBS) / (8000 * (index - 1))) : 0;
    const sag_L = (D_L !== 0) ? (D_L * (MBS * MBS) / (8000 * (index - 1))) : 0;

    // CT / ET defaults
    const CT_default = 1.4;
    const ET_default = 0.7;

    // For minus lenses, CT is thin; for plus lenses, ET is thin
    // We'll assume lensType controls which default to use for thin part
    // For minus: CT = CT_default; ET = sag + CT
    // For plus: ET = ET_default; CT = sag + ET
    function computeThickness(isMinus, sag) {
      if (isMinus) {
        const CT = CT_default;
        const ET = sag + CT;
        return {CT, ET};
      } else {
        const ET = ET_default;
        const CT = sag + ET;
        return {CT, ET};
      }
    }
    const tR_th = computeThickness(lensType==='minus', Math.abs(sag_R));
    const tL_th = computeThickness(lensType==='minus', Math.abs(sag_L));

    // t semi-finish: if minus t = ET + 2; if plus t = CT + 2
    const tR = (lensType==='minus') ? (tR_th.ET + 2) : (tR_th.CT + 2);
    const tL = (lensType==='minus') ? (tL_th.ET + 2) : (tL_th.CT + 2);

    // Round up to nearest integer mm per example
    const tR_ceil = Math.ceil(tR);
    const tL_ceil = Math.ceil(tL);
    const semiFinish = Math.max(tR_ceil, tL_ceil);

    // Grinding
    function grindParts(tChosen, ET) {
      const diff = tChosen - ET;
      const G = diff * 0.7;
      const F = diff * 0.2;
      const P = diff * 0.1;
      return {G, F, P, diff};
    }
    const grindR = grindParts(semiFinish, tR_th.ET);
    const grindL = grindParts(semiFinish, tL_th.ET);

    // Build output HTML
    document.getElementById('precal').innerHTML = `
      <div>ED/E</div><div>${ED.toFixed(2)} mm</div>
      <div>MBS</div><div>${MBS} mm</div>
      <div>SE (R)</div><div>${SE_R.toFixed(2)}</div>
      <div>SE (L)</div><div>${SE_L.toFixed(2)}</div>
      <div>BC (R)</div><div>${BC_R.toFixed(2)}</div>
      <div>BC (L)</div><div>${BC_L.toFixed(2)}</div>
    `;

    document.getElementById('tools').innerHTML = `
      <div>F1 (R)</div><div>${F1_R.toFixed(2)}</div>
      <div>F2 (R)</div><div>${F2_R.toFixed(2)}</div>
      <div>F2 (R cyl)</div><div>${F2_R_cyl.toFixed(2)}</div>
      <div>F1 (L)</div><div>${F1_L.toFixed(2)}</div>
      <div>F2 (L)</div><div>${F2_L.toFixed(2)}</div>
    `;

    document.getElementById('sag').innerHTML = `
      <div>Sag R (power ${D_R})</div><div>${sag_R_abs.toFixed(3)} mm</div>
      <div>Sag R (90° power ${D_R_90})</div><div>${Math.abs(sag_R_90).toFixed(3)} mm</div>
      <div>Sag L (power ${D_L})</div><div>${Math.abs(sag_L).toFixed(3)} mm</div>
    `;

    document.getElementById('thickness').innerHTML = `
      <div>CT default</div><div>${CT_default.toFixed(2)} mm</div>
      <div>ET default</div><div>${ET_default.toFixed(2)} mm</div>
      <div>ET (R)</div><div>${tR_th.ET.toFixed(3)} mm</div>
      <div>ET (L)</div><div>${tL_th.ET.toFixed(3)} mm</div>
      <div>t semi-finish (R raw)</div><div>${tR.toFixed(3)} mm</div>
      <div>t semi-finish (L raw)</div><div>${tL.toFixed(3)} mm</div>
      <div>t chosen (material)</div><div>${semiFinish} mm</div>
    `;

    document.getElementById('kartu').innerHTML = `
      <div>SPH (R): ${sphR} | CYL (R): ${cylR} | AXIS (R): ${getVal('axisR')||''}</div>
      <div>SPH (L): ${sphL} | CYL (L): ${cylL} | AXIS (L): ${getVal('axisL')||''}</div>
      <div>BC R: ${BC_R.toFixed(2)} | BC L: ${BC_L.toFixed(2)}</div>
      <div>Sag R: ${Math.abs(sag_R).toFixed(3)} mm | Sag L: ${Math.abs(sag_L).toFixed(3)} mm</div>
      <div>ET R: ${tR_th.ET.toFixed(3)} mm | ET L: ${tL_th.ET.toFixed(3)} mm</div>
      <div>t material chosen: ${semiFinish} mm</div>
      <div>Grinding R G/F/P: ${grindR.G.toFixed(3)} / ${grindR.F.toFixed(3)} / ${grindR.P.toFixed(3)}</div>
      <div>Grinding L G/F/P: ${grindL.G.toFixed(3)} / ${grindL.F.toFixed(3)} / ${grindL.P.toFixed(3)}</div>
    `;

    // show results
    document.getElementById('resultsCard').removeAttribute('aria-hidden');
    // scroll to results
    document.getElementById('resultsCard').scrollIntoView({behavior:'smooth'});

    // download PDF
    document.getElementById('download').onclick = ()=> {
      const element = document.getElementById('resultsCard');
      const opt = {
        margin:       0.4,
        filename:     'surfacing-result.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    };

  });

  document.getElementById('back').addEventListener('click', ()=> {
    document.getElementById('resultsCard').setAttribute('aria-hidden','true');
    window.scrollTo({top:0,behavior:'smooth'});
  });

});

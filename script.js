// Jeu de données synthétiques SIMULATION harmonisé avec le Modèle BL Bassine v2.2 (n°36) et les Vues Papa Waly v2.0 (n°35)
const SIMULATION_BL = [
  {
    bl_id: 1001,
    numero_bl: "BL-001",
    mission_id: "MISSION-TEST-01",
    client_id: "CLI-001",
    client_libelle: "Client A [SIMULÉ]",
    date_depart: "2026-11-09",
    date_livraison: "2026-11-09",
    produit: "GASOIL",
    chauffeur_id: "SIM-CHF-01",
    chauffeur_libelle: "Chauffeur A",
    vehicule_id: "VEH-001",
    vehicule_libelle: "DK-1234-AA",
    volume_charge_l: 18000,
    volume_livre_l: 18000,
    piece: "bl_001_simule.pdf",
    statut_livraison: "LIVRE",
    statut_validation: "VALIDE",
    saisi_par: "EXP-01",
    lien_doublon: null,
    codes_controle: [],
    anomalie_rapprochement: false,
    details_ecart: null,
    historique_statuts: "SOUMIS -> VALIDE (CTRL-01 : Conforme)",
    ref_facture: "SIM-2026-0041"
  },
  {
    bl_id: 1003,
    numero_bl: "BL-003",
    mission_id: "MISSION-TEST-03",
    client_id: "CLI-001",
    client_libelle: "Client A [SIMULÉ]",
    date_depart: "2026-11-10",
    date_livraison: "2026-11-10",
    produit: "ESSENCE",
    chauffeur_id: "SIM-CHF-03",
    chauffeur_libelle: "Chauffeur C",
    vehicule_id: "VEH-003",
    vehicule_libelle: "DK-3456-CC",
    volume_charge_l: 20000,
    volume_livre_l: 20000,
    piece: "bl_003_simule.pdf",
    statut_livraison: "LIVRE",
    statut_validation: "A_EXAMINER",
    saisi_par: "EXP-01",
    lien_doublon: null,
    codes_controle: [],
    anomalie_rapprochement: false,
    details_ecart: null,
    historique_statuts: "SOUMIS -> A_EXAMINER (En attente de contrôle)",
    ref_facture: "Non attribué"
  },
  {
    bl_id: 1004,
    numero_bl: "BL-004",
    mission_id: "MISSION-TEST-04",
    client_id: "CLI-003",
    client_libelle: "Client C [SIMULÉ]",
    date_depart: "2026-11-11",
    date_livraison: "2026-11-11",
    produit: "FIOUL",
    chauffeur_id: null,
    chauffeur_libelle: null,
    vehicule_id: null,
    vehicule_libelle: null,
    volume_charge_l: 15000,
    volume_livre_l: 15000,
    piece: "bl_004_simule.pdf",
    statut_livraison: "A_PLANIFIER",
    statut_validation: "SOUMIS",
    saisi_par: "EXP-02",
    lien_doublon: null,
    codes_controle: [],
    anomalie_rapprochement: false,
    details_ecart: null,
    historique_statuts: "SOUMIS (Affectation chauffeur/véhicule à confirmer)",
    ref_facture: "Non attribué"
  },
  {
    bl_id: 1005,
    numero_bl: "BL-005",
    mission_id: "MISSION-TEST-05",
    client_id: "CLI-002",
    client_libelle: "Client B [SIMULÉ]",
    date_depart: "2026-11-12",
    date_livraison: "2026-11-12",
    produit: "GASOIL",
    chauffeur_id: "SIM-CHF-02",
    chauffeur_libelle: "Chauffeur B",
    vehicule_id: "VEH-002",
    vehicule_libelle: "DK-5678-BB",
    volume_charge_l: 18000,
    volume_livre_l: 16500,
    piece: "bl_005_simule.pdf",
    statut_livraison: "LIVRE",
    statut_validation: "A_CORRIGER",
    saisi_par: "EXP-01",
    lien_doublon: null,
    codes_controle: ["BL-005"],
    anomalie_rapprochement: true,
    details_ecart: "Écart de volume : 16 500 L livrés sur le BL contre 18 000 L chargés / prévus sur la mission MISSION-TEST-05.",
    historique_statuts: "SOUMIS -> A_CORRIGER (Écart volume BL vs mission)",
    ref_facture: "Non attribué (bloqué)"
  }
];

let simulatedError = false;

const searchInput = document.getElementById("search-input");
const filterClient = document.getElementById("filter-client");
const filterMission = document.getElementById("filter-mission");
const filterProduit = document.getElementById("filter-produit");
const filterStatutLiv = document.getElementById("filter-statut-liv");
const filterStatutVal = document.getElementById("filter-statut-val");
const filterDateDebut = document.getElementById("filter-date-debut");
const filterDateFin = document.getElementById("filter-date-fin");
const filterAnomalie = document.getElementById("filter-anomalie");
const dateWarning = document.getElementById("date-warning");

const btnReset = document.getElementById("btn-reset");
const btnSimulateError = document.getElementById("btn-simulate-error");
const btnRetry = document.getElementById("btn-retry");

const stateError = document.getElementById("state-error");
const stateEmpty = document.getElementById("state-empty");
const tableWrapper = document.getElementById("table-wrapper");
const tbody = document.getElementById("bl-tbody");

const detailPanel = document.getElementById("detail-panel");
const detailTitle = document.getElementById("detail-title");
const detailContent = document.getElementById("detail-content");
const btnCloseDetail = document.getElementById("btn-close-detail");

function initSelectOptions() {
  const clients = [...new Map(SIMULATION_BL.map(b => [b.client_id, `${b.client_id} — ${b.client_libelle}`])).entries()];
  clients.forEach(([id, label]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = label;
    filterClient.appendChild(opt);
  });

  const missions = [...new Set(SIMULATION_BL.map(b => b.mission_id))];
  missions.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    filterMission.appendChild(opt);
  });
}

function getLivraisonBadgeClass(statut) {
  switch (statut) {
    case "LIVRE": return "badge-liv-livre";
    case "EN_COURS": return "badge-liv-cours";
    case "ANNULE": return "badge-liv-annule";
    default: return "badge-liv-plan";
  }
}

function getValidationBadgeClass(statut) {
  switch (statut) {
    case "VALIDE": return "badge-val-valide";
    case "SOUMIS": return "badge-val-soumis";
    case "A_EXAMINER": return "badge-val-examiner";
    case "DOUBLON_ECARTE": return "badge-val-doublon";
    default: return "badge-val-corriger";
  }
}

function updateKpis(list) {
  document.getElementById("kpi-total").textContent = list.length;
  document.getElementById("kpi-anomalies").textContent = list.filter(b => b.anomalie_rapprochement || b.statut_validation === "A_CORRIGER").length;
  document.getElementById("kpi-examiner").textContent = list.filter(b => b.statut_validation === "A_EXAMINER" || b.statut_validation === "SOUMIS").length;
  document.getElementById("kpi-valides").textContent = list.filter(b => b.statut_validation === "VALIDE").length;
}

function openDetail(bl) {
  detailTitle.textContent = `Détail & Rapprochement — ${bl.numero_bl} (bl_id : ${bl.bl_id})`;
  detailContent.innerHTML = `
    <div class="detail-card">
      <h4>Modèle BL (Dictionnaire Bassine v2.2 — n°36)</h4>
      <p><strong>mission_id :</strong> ${bl.mission_id}</p>
      <p><strong>client_id :</strong> ${bl.client_id} (${bl.client_libelle})</p>
      <p><strong>produit :</strong> ${bl.produit}</p>
      <p><strong>date_depart / date_livraison :</strong> ${bl.date_depart} → ${bl.date_livraison}</p>
      <p><strong>piece :</strong> ${bl.piece} · <strong>saisi_par :</strong> ${bl.saisi_par}</p>
    </div>
    <div class="detail-card">
      <h4>Affectation & Volumes (en litres)</h4>
      <p><strong>chauffeur_id :</strong> ${bl.chauffeur_id || "-"} (${bl.chauffeur_libelle || "Non fourni"})</p>
      <p><strong>vehicule_id :</strong> ${bl.vehicule_id || "-"} (${bl.vehicule_libelle || "Non fourni"})</p>
      <p><strong>volume_charge_l :</strong> ${bl.volume_charge_l.toLocaleString("fr-FR")} L</p>
      <p><strong>volume_livre_l :</strong> ${bl.volume_livre_l.toLocaleString("fr-FR")} L</p>
      <p><strong>lien_doublon :</strong> ${bl.lien_doublon || "Aucun"}</p>
    </div>
    <div class="detail-card">
      <h4>Statuts & Rapprochement (Vues Papa Waly n°35)</h4>
      <p><strong>statut_livraison :</strong> ${bl.statut_livraison}</p>
      <p><strong>statut_validation :</strong> ${bl.statut_validation}</p>
      <p><strong>historique_statuts :</strong> ${bl.historique_statuts}</p>
      <p><strong>Réf. facture provisoire :</strong> ${bl.ref_facture}</p>
      <p><strong>Diagnostic écart :</strong> ${bl.details_ecart || "Concordant — aucune anomalie détectée."}</p>
    </div>
  `;
  detailPanel.classList.remove("hidden");
}

function renderList() {
  const now = new Date();
  document.getElementById("last-updated").textContent =
    `Dernière mise à jour : ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

  if (simulatedError) {
    tableWrapper.classList.add("hidden");
    stateEmpty.classList.add("hidden");
    detailPanel.classList.add("hidden");
    stateError.classList.remove("hidden");
    updateKpis([]);
    return;
  }

  stateError.classList.add("hidden");

  const q = searchInput.value.trim().toLowerCase();
  const clientVal = filterClient.value;
  const missionVal = filterMission.value;
  const produitVal = filterProduit.value;
  const livVal = filterStatutLiv.value;
  const valVal = filterStatutVal.value;
  const dateDeb = filterDateDebut.value;
  const dateFin = filterDateFin.value;
  const onlyAnomalie = filterAnomalie.checked;

  if (dateDeb && dateFin && dateDeb > dateFin) {
    dateWarning.classList.remove("hidden");
    tableWrapper.classList.add("hidden");
    stateEmpty.classList.add("hidden");
    updateKpis([]);
    return;
  } else {
    dateWarning.classList.add("hidden");
  }

  const filtered = SIMULATION_BL.filter(bl => {
    const matchSearch =
      !q ||
      bl.numero_bl.toLowerCase().includes(q) ||
      String(bl.bl_id).includes(q);
    const matchClient = !clientVal || bl.client_id === clientVal;
    const matchMission = !missionVal || bl.mission_id === missionVal;
    const matchProduit = !produitVal || bl.produit === produitVal;
    const matchLiv = !livVal || bl.statut_livraison === livVal;
    const matchVal = !valVal || bl.statut_validation === valVal;
    const matchDateDeb = !dateDeb || bl.date_livraison >= dateDeb;
    const matchDateFin = !dateFin || bl.date_livraison <= dateFin;
    const matchAnom = !onlyAnomalie || bl.anomalie_rapprochement || bl.codes_controle.length > 0;

    return (
      matchSearch &&
      matchClient &&
      matchMission &&
      matchProduit &&
      matchLiv &&
      matchVal &&
      matchDateDeb &&
      matchDateFin &&
      matchAnom
    );
  });

  filtered.sort((a, b) => {
    if (b.date_livraison !== a.date_livraison) {
      return b.date_livraison.localeCompare(a.date_livraison);
    }
    return a.numero_bl.localeCompare(b.numero_bl);
  });

  updateKpis(filtered);

  if (filtered.length === 0) {
    tableWrapper.classList.add("hidden");
    detailPanel.classList.add("hidden");
    stateEmpty.classList.remove("hidden");
    return;
  }

  stateEmpty.classList.add("hidden");
  tableWrapper.classList.remove("hidden");

  tbody.innerHTML = "";
  filtered.forEach(bl => {
    const tr = document.createElement("tr");
    if (bl.anomalie_rapprochement) {
      tr.classList.add("row-anomalie");
    }

    const anomBadge = bl.anomalie_rapprochement
      ? `<span class="badge badge-anom-alert" title="${bl.details_ecart}">Écart (${bl.codes_controle.join(", ")})</span>`
      : `<span class="badge badge-anom-ok">Conforme</span>`;

    tr.innerHTML = `
      <td>${bl.bl_id}</td>
      <td><strong>${bl.numero_bl}</strong></td>
      <td>${bl.mission_id}</td>
      <td><strong>${bl.client_id}</strong><span class="sub-id">${bl.client_libelle}</span></td>
      <td>${bl.date_livraison}</td>
      <td>${bl.produit}</td>
      <td>${bl.chauffeur_id ? `<strong>${bl.chauffeur_id}</strong><span class="sub-id">${bl.chauffeur_libelle}</span>` : "-"}</td>
      <td>${bl.vehicule_id ? `<strong>${bl.vehicule_id}</strong><span class="sub-id">${bl.vehicule_libelle}</span>` : "-"}</td>
      <td>${bl.volume_livre_l.toLocaleString("fr-FR")} L / ${bl.volume_charge_l.toLocaleString("fr-FR")} L</td>
      <td><span class="badge ${getLivraisonBadgeClass(bl.statut_livraison)}">${bl.statut_livraison}</span></td>
      <td><span class="badge ${getValidationBadgeClass(bl.statut_validation)}">${bl.statut_validation}</span></td>
      <td>${anomBadge}</td>
      <td><button class="btn btn-secondary btn-sm" data-id="${bl.bl_id}">Voir</button></td>
    `;

    tr.querySelector("button").addEventListener("click", () => openDetail(bl));
    tbody.appendChild(tr);
  });
}

[searchInput, filterClient, filterMission, filterProduit, filterStatutLiv, filterStatutVal, filterDateDebut, filterDateFin, filterAnomalie].forEach(el => {
  el.addEventListener("input", renderList);
  el.addEventListener("change", renderList);
});

btnReset.addEventListener("click", () => {
  searchInput.value = "";
  filterClient.value = "";
  filterMission.value = "";
  filterProduit.value = "";
  filterStatutLiv.value = "";
  filterStatutVal.value = "";
  filterDateDebut.value = "";
  filterDateFin.value = "";
  filterAnomalie.checked = false;
  simulatedError = false;
  detailPanel.classList.add("hidden");
  renderList();
});

btnSimulateError.addEventListener("click", () => {
  simulatedError = true;
  renderList();
});

btnRetry.addEventListener("click", () => {
  simulatedError = false;
  renderList();
});

btnCloseDetail.addEventListener("click", () => {
  detailPanel.classList.add("hidden");
});

initSelectOptions();
renderList();

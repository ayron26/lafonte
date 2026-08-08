// ═══════════════════════════════════════════════════════════
// La Fonte — Analyse photo de repas (Cloudflare Worker)
// À coller tel quel dans un Worker sur workers.cloudflare.com
// Puis ajouter la variable secrète CLE_ANTHROPIC (ta clé API)
// ═══════════════════════════════════════════════════════════

export default {
  async fetch(request, env) {
    // CORS : autorise ton app à appeler ce serveur
    const enTetes = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: enTetes });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ erreur: "POST uniquement" }), { status: 405, headers: enTetes });
    }

    try {
      const { image, mediaType } = await request.json();
      if (!image) {
        return new Response(JSON.stringify({ erreur: "image manquante" }), { status: 400, headers: enTetes });
      }

      const reponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.CLE_ANTHROPIC,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: image } },
              { type: "text", text: `Analyse cette photo de repas. Identifie les aliments et estime les portions.

Réponds UNIQUEMENT avec un objet JSON valide, sans backticks ni texte autour, avec EXACTEMENT ces 5 clés :
{"nom": string, "totalCalories": number, "totalProteines": number, "totalGlucides": number, "totalLipides": number}

Règles strictes pour les 4 champs numériques :
- Ce sont des nombres purs, jamais du texte. Écris 45 et non "45", jamais "45g" ni "45 grammes" ni "environ 45".
- Estime réellement chacun des 4 champs (calories, protéines, glucides, lipides) à partir de ce que tu vois — ne laisse jamais un champ à 0 sauf si l'assiette ne contient vraiment aucun aliment.
- totalCalories est en kcal. totalProteines, totalGlucides et totalLipides sont en grammes.

Si aucun aliment n'est visible sur la photo, réponds : {"nom":"","totalCalories":0,"totalProteines":0,"totalGlucides":0,"totalLipides":0}` }
            ]
          }]
        })
      });

      const donnees = await reponse.json();
      if (!reponse.ok) {
        return new Response(JSON.stringify({ erreur: "API Anthropic : " + (donnees.error?.message || reponse.status) }), { status: 502, headers: enTetes });
      }

      const texte = (donnees.content || [])
        .filter(b => b.type === "text")
        .map(b => b.text)
        .join("\n")
        .replace(/```json|```/g, "")
        .trim();

      const resultat = JSON.parse(texte);
      return new Response(JSON.stringify(resultat), { headers: enTetes });

    } catch (e) {
      return new Response(JSON.stringify({ erreur: "Analyse impossible : " + e.message }), { status: 500, headers: enTetes });
    }
  }
};

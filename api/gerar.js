export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo nao permitido" });

  const { url, conteudo, jobDescription, persona, canal, objetivo, contexto } = req.body;

  if (!persona) return res.status(400).json({ error: "Persona e obrigatoria." });
  if (!url && !conteudo) return res.status(400).json({ error: "Informe o link do site ou cole o conteudo manualmente." });

  let conteudoFinal = conteudo || "";

  if (url && url.startsWith("http")) {
    try {
      const siteRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; bot/1.0)" },
        signal: AbortSignal.timeout(8000)
      });
      const html = await siteRes.text();
      const semTags = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim()
        .slice(0, 5000);
      conteudoFinal = semTags + (conteudo ? "\n\nContexto adicional:\n" + conteudo : "");
    } catch (e) {
      if (!conteudo) return res.status(400).json({ error: "Nao foi possivel acessar o site. Cole o conteudo manualmente." });
    }
  }

  const jobInsight = jobDescription
    ? `\n\nJOB DESCRIPTION DA VAGA ABERTA:\n${jobDescription.slice(0, 2000)}\n\nUse o job description para identificar os desafios especificos que a empresa enfrenta para preencher essa posicao: requisitos dificeis de encontrar, seniority exigida, combinacao rara de perfis, volume de candidatos sem aderencia. Use esses dados como argumento de dor real no RAIZ — especialmente no R e no A.`
    : "";

  const SOLUCAO = `
SDR READY — Selecao de talentos conduzida pela Raquel Carmo, especialista em pre-vendas B2B com 13 anos de experiencia.

O que inclui:
- Divulgacao da vaga nos canais certos para atrair perfis de pre-vendas
- Triagem tecnica e comportamental dos candidatos
- Fase pratica com simulacoes reais de prospeccao (o que nenhum RH generalista faz)
- Entrega de 3 finalistas com analise comportamental detalhada
- Treinamento do SDR escolhido apos a contratacao
- Acompanhamento por 2 semanas pos-contratacao para garantir ativacao rapida

Por que e diferente:
- Raquel avalia o que nenhum RH generalista avalia: se o candidato sabe prospectar de verdade
- Nao entrega apenas CVs — entrega finalistas ja testados tecnicamente em simulacoes reais
- O treinamento pos-contratacao reduz drasticamente o tempo de ramp-up
- 13 anos construindo e liderando times de pre-vendas em Thomson Reuters, Linte, Abler e Transfeera

Para quem e ideal:
- Empresas que nao tem expertise interna para avaliar candidatos de pre-vendas
- Empresas que ja contrataram SDRs errados e querem evitar retrabalho
- Empresas abrindo o primeiro time de outbound
- Empresas em expansao que precisam escalar com qualidade`;

  const CASES = `
- Thomson Reuters: estruturou o time de BDR outbound do zero. 1 BDR contratado pelo processo certo passou a fazer o resultado de 4 — com qualidade, nao apenas volume.
- Linte (SaaS B2B): escalou de 1 para 11 pre-vendedores outbound. 45% das novas vendas passaram a vir do time prospectado e treinado pelo processo SDR Ready.
- Delage (high-ticket, ciclo longo, multiplos decisores): estruturou o primeiro time de pre-vendas para contexto complexo. Resultado: aumento de ticket medio e reducao de ciclo de vendas.
- Abler: construcao e lideranca de time outbound B2B desde o inicio.`;

  const prompt = `Voce e a Raquel Carmo, fundadora da SDR de Sucesso, especialista em recrutamento, selecao e treinamento de times de pre-vendas B2B com 13 anos de experiencia. Voce escreve mensagens diretas, personalizadas e consultivas — nunca genericas, nunca soando como RH tradicional.

SOLUCAO OFERTADA:
${SOLUCAO}

CASES DE SUCESSO:
${CASES}

CONTEXTO DA ABORDAGEM:
- Conteudo do prospect (site ou texto colado): ${conteudoFinal}
- Persona alvo: ${persona}
- Canal da primeira abordagem: ${canal}
- Objetivo: ${objetivo}
${contexto ? `- Contexto adicional: ${contexto}` : ""}
${jobInsight}

FRAMEWORK RAIZ — aplique rigorosamente em TODAS as 5 mensagens:
R (Relevancia Real): abra com uma observacao especifica e verificavel sobre o prospect. Se houver job description, use os requisitos reais da vaga como gancho de dor. Nunca elogio generico. Nunca "vi seu perfil e me identifiquei".
A (Abertura Contextual): conecte com a dor de mercado. Ex: a maioria das empresas perde 3 a 6 meses com SDR errado porque o processo seletivo nao testou prospeccao na pratica. Ou: RH generalista nao consegue simular uma cold call real na entrevista — e ai contrata pela apparencia, nao pela habilidade.
I (Insight): use um case real da SDR de Sucesso. Quantifique quando possivel. Ex: na Linte, o processo seletivo escalou de 1 para 11 SDRs — 45% das novas vendas passaram a vir desse time. Ou: na Thomson, 1 BDR contratado e treinado pelo processo certo fez o resultado de 4.
Z (Zona de Convite): pergunta leve, de baixo compromisso. Ex: Como voces avaliam hoje se um candidato sabe prospectar de verdade? ou Faz sentido trocarmos uma ideia sobre o processo em 15 minutos? NUNCA "vamos marcar uma reuniao".

REGRAS DE TOM:
- Use o primeiro nome da persona em todas as mensagens
- Tom direto, humano, consultivo — nao de headhunter nem de RH
- Voce e a Raquel falando — use "eu" e "meu processo"
- Adapte ao cargo: CEO/Fundador — custo de contratacao errada e tempo perdido. Diretor Comercial — ramp-up, meta, resultado. RH/People — processo, assertividade, perfil tecnico
- NUNCA cite o nome do produto logo de cara — fale em resultado e dor resolvida primeiro
- LinkedIn: curto, paragrafos de 1-2 linhas, direto
- Email: mais longo, contextual, feche com Abracos e Raquel Carmo | SDR de Sucesso
- WhatsApp: muito curto, informal, uma pergunta no final
- Email de breakup: curto, educado, sem pressao

Gere as 5 mensagens completas seguindo o RAIZ em cada uma.

Responda SOMENTE em JSON valido, sem markdown, sem texto fora do JSON:
{
  "sinais_de_compra": ["sinal especifico 1 observado no prospect", "sinal 2", "sinal 3"],
  "justificativa_fit": "2-3 frases sobre por que esse prospect tem fit real com o SDR Ready, usando dados do conteudo fornecido",
  "abordagem_principal": "mensagem completa para o canal ${canal} seguindo RAIZ — tom e tamanho adequados ao canal escolhido",
  "followup_whatsapp": "mensagem curta de follow-up WhatsApp, informal, referenciando a abordagem anterior, com uma pergunta no final — max 5 linhas",
  "email_1": "ASSUNTO: [linha de assunto]\n\n[corpo do email — retoma contexto, aprofunda a dor, usa o case mais relevante para esse segmento, CTA leve no final. Feche com Abracos, Raquel Carmo | SDR de Sucesso]",
  "email_2": "ASSUNTO: [linha de assunto]\n\n[corpo do email — angulo diferente: foca no custo invisivel de contratar errado: tempo de ramp-up perdido, meta nao batida, retrabalho do gestor. Pergunta de diagnostico no final. Feche com Abracos, Raquel Carmo | SDR de Sucesso]",
  "email_3": "ASSUNTO: [linha de assunto]\n\n[email de breakup — curto, educado, reafirma o valor, deixa porta aberta. Feche com Abracos, Raquel Carmo | SDR de Sucesso]",
  "dicas_de_follow_up": ["dica pratica e especifica para esse prospect 1", "dica pratica 2"]
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 2800,
        messages: [
          { role: "system", content: "Voce e especialista em prospeccao B2B e recrutamento de times de pre-vendas. Responda sempre em JSON valido, sem texto fora do JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err?.error?.message || "Erro na API" });
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Erro interno" });
  }
}

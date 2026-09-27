function has(text, pattern){ return pattern.test(text); }

const CONTROLS = [
  ["independent_assurance","Independent assurance",/(soc\s*2|soc2|iso\s*27001|iso27001|independent audit|external audit|third[- ]party audit|assurance report)/i],
  ["access_control","Access control",/(access control|identity and access|iam|least privilege|privileged access|mfa|multi-factor|multifactor)/i],
  ["incident_response","Incident response",/(incident response|security incident|breach notification|incident notification|cyber incident)/i],
  ["encryption","Encryption",/(encryption|encrypted|tls|at rest|in transit|cryptograph)/i],
  ["continuity","Business continuity / recovery",/(business continuity|disaster recovery|disaster recovery plan|backup|recovery point|recovery time|bc\/?dr)/i],
  ["vulnerability_management","Vulnerability management",/(vulnerability management|vulnerability scan|penetration test|penetration testing|patch management|security testing)/i],
  ["privacy","Privacy / data governance",/(privacy|personal data|personal information|gdpr|data protection|data processing|retention|deletion)/i],
  ["supply_chain","Supply-chain transparency",/(subprocessor|sub-processors|supplier|supply chain|third[- ]party|fourth[- ]party)/i],
  ["logging","Logging / monitoring",/(logging|monitoring|siem|security monitoring|audit logs|log retention)/i]
];

function classifyEvidence(text, pattern){
  const sentences = text.replace(/\s+/g," ").split(/(?<=[.!?])\s+/).filter(Boolean);
  const hits = sentences.filter(s => pattern.test(s)).slice(0,4);
  if(!hits.length) return {status:"unknown",evidence:[]};
  const negative = hits.some(s => /not implemented|not in place|no evidence|does not|doesn't|without|not available|not provided|none/i.test(s));
  return {status:negative?"partial":"supported",evidence:hits};
}

export function assessEvidence({vendorUrl="",vendorName="",evidence="",notes=""}={}){
  const text = [vendorName,vendorUrl,evidence,notes].filter(Boolean).join("\n").slice(0,100000);
  const controls = CONTROLS.map(([id,label,pattern]) => {
    const r=classifyEvidence(text,pattern);
    return {id,label,status:r.status,evidence:r.evidence};
  });
  const supported=controls.filter(x=>x.status==="supported").length;
  const partial=controls.filter(x=>x.status==="partial").length;
  const unknown=controls.filter(x=>x.status==="unknown").length;
  const riskLevel = unknown>=6 || partial>=4 ? "high" : unknown>=3 || partial>=2 ? "medium" : unknown>=1 || partial>=1 ? "low" : "informational";
  const followUps=[];
  for(const c of controls){
    if(c.status==="unknown") followUps.push("Provide evidence for "+c.label+".");
    else if(c.status==="partial") followUps.push("Clarify scope, owner, frequency and supporting evidence for "+c.label+".");
  }
  const decisionQuestions=[
    "Is the evidence current for the assessment period?",
    "Does the evidence cover the service and data actually in scope?",
    "Are unresolved gaps acceptable, conditional, or escalation-worthy?",
    "When should this vendor be reassessed?"
  ];
  return {
    service:"Evidence-first Vendor Assessment",
    generatedAt:new Date().toISOString(),
    vendor:{name:vendorName||"Unspecified vendor",url:vendorUrl||""},
    summary:{riskLevel,supported,partial,unknown,totalControls:controls.length},
    controls,
    followUps:followUps.slice(0,12),
    decisionQuestions,
    limitations:[
      "This is a first-pass evidence organization and gap analysis, not a penetration test or certification.",
      "A missing public statement or document is treated as unknown, not proof that a control is absent.",
      "Human review is required before approving, conditioning, escalating or rejecting a vendor."
    ]
  };
}

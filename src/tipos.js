// Os três tipos de senha (requisito do laboratório)

export const TIPOS = {
  SP: {
    nome: 'Prioritária',
    descricao: 'Idosos, gestantes, pessoas com deficiência',
    falado: 'prioritária',
    tempoMedio: 'cerca de 15 min',
  },
  SE: {
    nome: 'Retirada de exames',
    descricao: 'Só vai buscar o resultado',
    falado: 'retirada de exames',
    tempoMedio: 'cerca de 1 min',
  },
  SG: {
    nome: 'Geral',
    descricao: 'Demais atendimentos',
    falado: 'geral',
    tempoMedio: 'cerca de 5 min',
  },
}

// Ordem dos botões no totem
export const ORDEM_TIPOS = ['SP', 'SE', 'SG']

// rotulo("SP", 7) -> "SP 007"
export function rotulo(tipo, sequencial) {
  return `${tipo} ${String(sequencial).padStart(3, '0')}`
}

// "261127-SP001" -> 1
export function sequencialDoNumero(numero) {
  return Number(numero.slice(-3))
}

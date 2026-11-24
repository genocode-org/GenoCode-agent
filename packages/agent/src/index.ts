// An agent that designs GenoCode creatures from a description, with Claude, and the tools it uses:
// checking, drawing (to PNG, at any time), listing genes and saving.

export {
  designCreature,
  DEFAULT_MODEL,
  toContent,
  type DesignOptions,
  type DesignResult,
  type Progress,
} from "./agent.js";
export {
  checkCreature,
  checkFamily,
  describeDiagnostics,
  describeGenes,
  finishCreature,
  listGenes,
  MAX_RENDER_TIMES,
  MAX_VIEWS,
  renderCreature,
  renderPng,
  VIEWS,
  type Finished,
  type Look,
  type RenderOptions,
  type ToolOutput,
} from "./tools.js";
export { systemPrompt } from "./prompt.js";
export { encodePng } from "./png.js";

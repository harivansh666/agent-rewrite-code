import { model } from "./utils/ai.model.js";

console.log("HHH");
const res = await model.invoke("what is langchain");

console.log(res);

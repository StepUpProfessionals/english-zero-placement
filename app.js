const STATE = {
  data: null,
  index: 0,
  answers: []
};

const el = (id) => document.getElementById(id);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

async function loadQuestions(){
  const res = await fetch("test-ubicacion-nivel0.json");
  if(!res.ok) throw new Error("No se pudo cargar el archivo del test.");
  const data = await res.json();
  STATE.data = data;
  STATE.answers = Array(data.questions.length).fill(null);
}

function render(){
  const qList = STATE.data.questions;
  const total = qList.length;
  const i = clamp(STATE.index, 0, total - 1);
  const q = qList[i];

  el("progressText").textContent = `Pregunta ${i + 1} de ${total}`;
  el("progressBar").style.width = `${Math.round(((i + 1) / total) * 100)}%`;

  el("questionTitle").textContent = q.question;
  el("questionHint").textContent = "";

  const optionsWrap = el("options");
  optionsWrap.innerHTML = "";

  q.options.forEach((opt, idx) => {
    const label = document.createElement("label");
    label.className = "option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "opt";
    input.checked = STATE.answers[i] === idx;

    const span = document.createElement("span");
    span.textContent = opt;

    label.appendChild(input);
    label.appendChild(span);

    if (STATE.answers[i] === idx) label.classList.add("selected");

    label.addEventListener("click", () => {
      STATE.answers[i] = idx;
      render();
    });

    optionsWrap.appendChild(label);
  });

  el("backBtn").disabled = i === 0;
  el("nextBtn").disabled = STATE.answers[i] === null;
  el("nextBtn").textContent = (i === total - 1) ? "Finalizar" : "Siguiente";
}

function getScore(){
  let correct = 0;
  STATE.data.questions.forEach((q, i) => {
    if (q.correctAnswerIndex !== undefined &&
        STATE.answers[i] === q.correctAnswerIndex) {
      correct++;
    }
  });
  return correct;
}

function getMaxScore(){
  // Cuenta solo las preguntas que tienen correctAnswerIndex (las evaluables)
  return STATE.data.questions.filter(q => q.correctAnswerIndex !== undefined).length;
}

function showResult(){
  const score = getScore();
  const maxScore = getMaxScore(); // debería ser 9

  // Muestra puntaje sin juicio
  if (el("scoreText")) {
    el("scoreText").textContent = `Respuestas correctas: ${score} de ${maxScore}`;
  }

 // Texto de ruta (ajustado a 0–3, 4–6, 7–9)
let routeText = "Con base en sus respuestas, le indicaremos por dónde empezar.";

if (score <= 3) {
  routeText =
    "Aún no reconoce algunas estructuras básicas del inglés o reconoce muy pocas.\n" +
    "Se recomienda iniciar el entrenamiento desde la Lección 1 para trabajar pronunciación, estructura y uso desde la base.";
} else if (score <= 6) {
  routeText =
    "Reconoce estructuras básicas, pero presenta vacíos al usarlas en contexto real.\n" +
    "Se recomienda iniciar el entrenamiento desde la Lección 1 para reforzar pronunciación y uso guiado del inglés.";
} else {
  routeText =
    "Reconoce estructuras básicas, pero aún necesita entrenar pronunciación y uso en contexto.\n" +
    "Se recomienda iniciar el entrenamiento desde la Lección 1 para transformar conocimiento pasivo en uso real del inglés.";
}

  el("routeTitle").textContent = "Ruta recomendada";
  el("routeDesc").textContent = routeText;

  el("ctaBtn").textContent = "Escribirme por WhatsApp";
  const waMessage = `Hola, realicé el Test de Ubicación y obtuve ${score} de ${maxScore} respuestas correctas. Quisiera saber por dónde empezar.`;

el("ctaBtn").href =
  "https://wa.me/573167850234?text=" + encodeURIComponent(waMessage);


  el("card").classList.add("hidden");
  el("result").classList.remove("hidden");
}

function restart(){
  STATE.index = 0;
  STATE.answers = Array(STATE.data.questions.length).fill(null);
  el("result").classList.add("hidden");
  el("card").classList.remove("hidden");
  render();
}

function bind(){
  el("backBtn").addEventListener("click", () => {
    STATE.index--;
    render();
  });

  el("nextBtn").addEventListener("click", () => {
    if (STATE.index === STATE.data.questions.length - 1) {
      showResult();
    } else {
      STATE.index++;
      render();
    }
  });

  el("restartBtn").addEventListener("click", restart);
}

(async function init(){
  try{
    await loadQuestions();
    bind();
    render();
  } catch (err){
    console.error(err);
    el("questionTitle").textContent = "Error al cargar el test.";
  }
})();



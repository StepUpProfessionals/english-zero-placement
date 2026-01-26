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

function showResult(){
  const score = getScore();

  let routeText = "Con base en sus respuestas, le indicaremos por dónde empezar.";
  if (score <= 2) {
    routeText = "Usted puede iniciar desde la Lección 1, diseñada para personas que empiezan desde cero.";
  } else if (score <= 4) {
    routeText = "Usted cuenta con algunas bases. Recomendamos iniciar desde una lección intermedia para organizar su conocimiento.";
  } else {
    routeText = "Usted tiene una base funcional. Podemos ayudarle a consolidar y avanzar con mayor seguridad.";
  }

  el("routeTitle").textContent = "Ruta recomendada";
  el("routeDesc").textContent = routeText;

  el("ctaBtn").textContent = "Escribirme por WhatsApp";
  el("ctaBtn").href =
    "https://wa.me/573167850234?text=Hola%2C%20realic%C3%A9%20el%20Test%20de%20Ubicaci%C3%B3n%20y%20quisiera%20saber%20por%20d%C3%B3nde%20empezar.";

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

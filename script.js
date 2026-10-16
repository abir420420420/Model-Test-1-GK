let questions = [];
let userAnswers = {};
let timerInterval = null;
let totalTime = 30 * 60; // 30 minutes in seconds
let candidateData = { name: "", roll: "" };

// Fetch Questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        questions = await response.json();
        renderQuestions();
        renderPalette();
    } catch (error) {
        console.error("Questions load kora jaayni:", error);
        alert("প্রশ্ন লোড করতে সমস্যা হয়েছে! দয়া করে নিশ্চিত করুন questions.json ফাইলটি ঠিক আছে।");
    }
}

// Start Exam Function
function startExam() {
    const nameInput = document.getElementById('candidate-name').value.trim();
    const rollInput = document.getElementById('candidate-roll').value.trim();

    if (!nameInput || !rollInput) {
        alert("দয়া করে নাম এবং রোল নম্বর ইনপুট দিন!");
        return;
    }

    candidateData.name = nameInput;
    candidateData.roll = rollInput;

    document.getElementById('user-display-info').innerText = `নাম: ${candidateData.name} | রোল: ${candidateData.roll}`;

    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('exam-screen').classList.remove('hidden');

    loadQuestions();
    startTimer();
}

// Render Questions to HTML
function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = "";

    questions.forEach((q, index) => {
        const qCard = document.createElement('div');
        qCard.className = 'question-card';
        qCard.id = `q-card-${index}`;

        let optionsHTML = "";
        q.options.forEach((opt, optIdx) => {
            optionsHTML += `
                <li class="option-item">
                    <label>
                        <input type="radio" name="question-${index}" value="${optIdx}" onchange="selectOption(${index}, ${optIdx})">
                        ${opt}
                    </label>
                </li>
            `;
        });

        qCard.innerHTML = `
            <div class="question-title">${index + 1}. ${q.question}</div>
            <ul class="options-list">${optionsHTML}</ul>
        `;

        container.appendChild(qCard);
    });
}

// Render Navigation Palette
function renderPalette() {
    const palette = document.getElementById('palette-container');
    palette.innerHTML = "";

    questions.forEach((_, index) => {
        const btn = document.createElement('div');
        btn.className = 'palette-btn';
        btn.id = `palette-btn-${index}`;
        btn.innerText = index + 1;
        btn.onclick = () => {
            document.getElementById(`q-card-${index}`).scrollIntoView({ behavior: 'smooth' });
        };
        palette.appendChild(btn);
    });
}

// Record User Choice
function selectOption(qIndex, optIndex) {
    userAnswers[qIndex] = optIndex;
    const pBtn = document.getElementById(`palette-btn-${qIndex}`);
    if (pBtn) {
        pBtn.classList.add('answered');
    }
}

// Timer Logic
function startTimer() {
    timerInterval = setInterval(() => {
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;

        document.getElementById('timer-display').innerText = 
            `সময় বাকি: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (totalTime <= 0) {
            clearInterval(timerInterval);
            alert("সময় শেষ! আপনার উত্তরপত্র স্বয়ংক্রিয়ভাবে সাবমিট হচ্ছে।");
            calculateAndShowResult();
        }
        totalTime--;
    }, 1000);
}

// Confirmation before Submission
function confirmSubmit() {
    const answeredCount = Object.keys(userAnswers).length;
    if (confirm(`আপনি কি নিশ্চিত? মোট ৫০টির মধ্যে ${answeredCount}টি প্রশ্নের উত্তর দিয়েছেন।`)) {
        clearInterval(timerInterval);
        calculateAndShowResult();
    }
}

// Calculate Score & Show Result
function calculateAndShowResult() {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    questions.forEach((q, index) => {
        if (userAnswers.hasOwnProperty(index)) {
            if (userAnswers[index] === q.answer) {
                correct++;
            } else {
                incorrect++;
            }
        } else {
            unanswered++;
        }
    });

    // Negative marking: -0.25 per incorrect answer
    let finalScore = (correct * 1.0) - (incorrect * 0.25);
    if (finalScore < 0) finalScore = 0;

    document.getElementById('exam-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');

    document.getElementById('result-user-info').innerHTML = 
        `<h4>পরীক্ষার্থী: ${candidateData.name}</h4><p>রোল: ${candidateData.roll}</p>`;

    document.getElementById('stat-correct').innerText = correct;
    document.getElementById('stat-incorrect').innerText = incorrect;
    document.getElementById('stat-unanswered').innerText = unanswered;
    document.getElementById('stat-score').innerText = finalScore.toFixed(2);
      }
      

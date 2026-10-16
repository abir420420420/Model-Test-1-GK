let questions = [];
let userAnswers = {};
let timerInterval = null;
let totalTime = 30 * 60; // 30 minutes
let candidateData = { name: "", roll: "" };

async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error("Network response was not ok");
        questions = await response.json();
        renderQuestions();
        renderPalette();
    } catch (error) {
        console.error("Error loading questions:", error);
        alert("প্রশ্ন লোড করতে সমস্যা হয়েছে! দয়া করে নিশ্চিত করুন একই ফোল্ডারে questions.json ফাইলটি সঠিকভাবে আছে।");
    }
}

function startExam() {
    const nameInput = document.getElementById('candidate-name').value.trim();
    const rollInput = document.getElementById('candidate-roll').value.trim();

    if (!nameInput || !rollInput) {
        alert("দয়া করে আপনার নাম এবং রোল নম্বর লিখুন!");
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

function selectOption(qIndex, optIndex) {
    userAnswers[qIndex] = optIndex;
    const pBtn = document.getElementById(`palette-btn-${qIndex}`);
    if (pBtn) {
        pBtn.classList.add('answered');
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;

        document.getElementById('timer-display').innerText = 
            `সময় বাকি: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (totalTime <= 0) {
            clearInterval(timerInterval);
            alert("সময় শেষ! আপনার পরীক্ষা স্বয়ংক্রিয়ভাবে সাবমিট হয়ে গেছে।");
            calculateAndShowResult();
        }
        totalTime--;
    }, 1000);
}

function confirmSubmit() {
    const answeredCount = Object.keys(userAnswers).length;
    if (confirm(`আপনি কি পরীক্ষা সাবমিট করতে চান? মোট ৫০টির মধ্যে ${answeredCount}টি প্রশ্নের উত্তর দিয়েছেন।`)) {
        clearInterval(timerInterval);
        calculateAndShowResult();
    }
}

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

    // Negative marking: 0.25 deduction per wrong answer
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

    renderReview();
}

function renderReview() {
    const reviewContainer = document.getElementById('review-container');
    let reviewHTML = '<hr style="margin: 2rem 0;"><h3 style="text-align: center; color: #2563eb; margin-bottom: 1rem;">প্রশ্ন ও সঠিক উত্তরমালা পর্যালোচনা</h3>';

    questions.forEach((q, index) => {
        const userAnsIndex = userAnswers[index];
        const correctAnsIndex = q.answer;
        let statusText = "";

        if (userAnsIndex === undefined) {
            statusText = '<span style="color: gray; font-weight: bold;">(উত্তর দেওয়া হয়নি)</span>';
        } else if (userAnsIndex === correctAnsIndex) {
            statusText = '<span style="color: #10b981; font-weight: bold;">(সঠিক)</span>';
        } else {
            statusText = '<span style="color: #ef4444; font-weight: bold;">(ভুল)</span>';
        }

        reviewHTML += `
            <div style="text-align: left; background: #f8fafc; padding: 12px; margin-top: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <p><strong>${index + 1}. ${q.question}</strong> ${statusText}</p>
                <p style="color: #10b981; margin-top: 4px;">✔ সঠিক উত্তর: ${q.options[correctAnsIndex]}</p>
                ${userAnsIndex !== undefined && userAnsIndex !== correctAnsIndex ? `<p style="color: #ef4444; margin-top: 2px;">✖ আপনার উত্তর: ${q.options[userAnsIndex]}</p>` : ''}
            </div>
        `;
    });

    reviewContainer.innerHTML = reviewHTML;
}

// রেজাল্ট পেজে রিভিউ সেকশন দেখানোর জন্য কোড
function renderReview() {
    const resultBox = document.getElementById('result-screen');
    let reviewHTML = '<h3 style="margin-top: 2rem; text-align: center;">প্রশ্ন ও সঠিক উত্তরমালা</h3>';

    questions.forEach((q, index) => {
        const userAnsIndex = userAnswers[index];
        const correctAnsIndex = q.answer;
        let statusText = "";

        if (userAnsIndex === undefined) {
            statusText = '<span style="color: gray;">(উত্তর দেওয়া হয়নি)</span>';
        } else if (userAnsIndex === correctAnsIndex) {
            statusText = '<span style="color: green;">(সঠিক)</span>';
        } else {
            statusText = '<span style="color: red;">(ভুল)</span>';
        }

        reviewHTML += `
            <div style="text-align: left; background: #f8fafc; padding: 10px; margin-top: 10px; border-radius: 5px; border: 1px solid #ddd;">
                <p><strong>${index + 1}. ${q.question}</strong> ${statusText}</p>
                <p style="color: #10b981; font-weight: bold;">সঠিক উত্তর: ${q.options[correctAnsIndex]}</p>
                ${userAnsIndex !== undefined && userAnsIndex !== correctAnsIndex ? `<p style="color: #ef4444;">আপনার উত্তর: ${q.options[userAnsIndex]}</p>` : ''}
            </div>
        `;
    });

    resultBox.querySelector('.card').innerHTML += reviewHTML;
}

/* =========================================================
   QCAASNET — BE QUANTUM READY
   Quantum Readiness Assessment Tool
   JavaScript / Scoring Engine v1.0
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       CONFIGURATION
       ===================================================== */

    const TOTAL_STEPS = 5;

    const SCORING = {
        selfWeight: 0.35,
        cryptoWeight: 0.25,
        riskWeight: 0.25,
        vendorWeight: 0.15
    };

    const STATUS_BANDS = [
        {
            min: 0.00,
            max: 0.399999,
            label: "NOT READY"
        },
        {
            min: 0.40,
            max: 0.599999,
            label: "INITIAL READINESS"
        },
        {
            min: 0.60,
            max: 0.799999,
            label: "ADVANCING"
        },
        {
            min: 0.80,
            max: 1.00,
            label: "QUANTUM READY"
        }
    ];

    /* =====================================================
       DOM REFERENCES
       ===================================================== */

    const welcomeScreen =
        document.getElementById("welcome-screen");

    const assessmentScreen =
        document.getElementById("assessment-screen");

    const resultsScreen =
        document.getElementById("results-screen");

    const startButton =
        document.getElementById("start-assessment");

    const previousButton =
        document.getElementById("previous-step");

    const nextButton =
        document.getElementById("next-step");

    const calculateButton =
        document.getElementById("calculate-results");

    const restartButton =
        document.getElementById("restart-assessment");

    const progressLabel =
        document.getElementById("progress-label");

    const progressPercent =
        document.getElementById("progress-percent");

    const progressBar =
        document.getElementById("progress-bar");

    const overallScore =
        document.getElementById("overall-score");

    const readinessStatus =
        document.getElementById("readiness-status");

    const resultsSummary =
        document.getElementById("results-summary");

    const resultsOrganization =
        document.getElementById("results-organization");

    const selfScoreElement =
        document.getElementById("self-score");

    const cryptoScoreElement =
        document.getElementById("crypto-score");

    const riskScoreElement =
        document.getElementById("risk-score");

    const vendorScoreElement =
        document.getElementById("vendor-score");

    const keyGapsElement =
        document.getElementById("key-gaps");

    const recommendationsElement =
        document.getElementById("recommendations");

    const assetList =
        document.getElementById("crypto-assets");

    const riskList =
        document.getElementById("risk-assets");

    const addAssetButton =
        document.getElementById("add-asset");

    const addRiskButton =
        document.getElementById("add-risk");

    const steps = Array.from(
        document.querySelectorAll(".assessment-step")
    );

    let currentStep = 1;

    /* =====================================================
       ASSESSMENT STATE
       ===================================================== */

    const assessment = {
        assessmentId: createAssessmentId(),

        organization: {
            name: "",
            contact: ""
        },

        selfAssessment: {},

        cryptoInventory: [],

        riskRegister: [],

        vendorAssessment: {},

        vendorAlgorithms: "",

        results: {}
    };

    /* =====================================================
       INITIALIZATION
       ===================================================== */

    function init() {

        if (
            !welcomeScreen ||
            !assessmentScreen ||
            !resultsScreen
        ) {
            console.error(
                "QCAASNET Quantum Readiness Tool: required screens are missing."
            );

            return;
        }

        bindEvents();

        showScreen("welcome");

        updateProgress();
    }

    function bindEvents() {

        startButton?.addEventListener(
            "click",
            startAssessment
        );

        previousButton?.addEventListener(
            "click",
            previousStep
        );

        nextButton?.addEventListener(
            "click",
            nextStep
        );

        calculateButton?.addEventListener(
            "click",
            calculateAndShowResults
        );

        restartButton?.addEventListener(
            "click",
            restartAssessment
        );

        addAssetButton?.addEventListener(
            "click",
            addCryptoAsset
        );

        addRiskButton?.addEventListener(
            "click",
            addRiskAsset
        );

        document.addEventListener(
            "change",
            handleAnswerChange
        );

        document.addEventListener(
            "input",
            handleInputChange
        );
    }

    /* =====================================================
       SCREEN / STEP NAVIGATION
       ===================================================== */

function startAssessment() {

    showScreen("assessment");

    currentStep = 1;

    showStep(currentStep);
}

    function showScreen(screenName) {

        welcomeScreen.hidden =
            screenName !== "welcome";

        assessmentScreen.hidden =
            screenName !== "assessment";

        resultsScreen.hidden =
            screenName !== "results";
    }

function showStep(stepNumber) {

    currentStep = Math.min(
        TOTAL_STEPS,
        Math.max(1, stepNumber)
    );

    steps.forEach((step) => {

        const stepValue =
            Number(step.dataset.step);

        step.hidden =
            stepValue !== currentStep;
    });

    updateProgress();
    updateNavigation();
}

    function nextStep() {

    if (!validateCurrentStep()) {
        return;
    }

    if (currentStep < TOTAL_STEPS) {

        showStep(
            currentStep + 1
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}

    function previousStep() {

        if (currentStep > 1) {

            showStep(
                currentStep - 1
            );
        }
    }

    function updateNavigation() {

        if (
            !previousButton ||
            !nextButton ||
            !calculateButton
        ) {
            return;
        }

        previousButton.hidden =
            currentStep === 1;

        if (
            currentStep === TOTAL_STEPS
        ) {

            nextButton.hidden = true;

            calculateButton.hidden = false;

        } else {

            nextButton.hidden = false;

            calculateButton.hidden = true;
        }
    }

    function updateProgress() {

        if (
            !progressLabel ||
            !progressPercent ||
            !progressBar
        ) {
            return;
        }

        const percent = Math.round(
    (currentStep / TOTAL_STEPS) * 100
);

        progressLabel.textContent =
            `Step ${currentStep} of ${TOTAL_STEPS}`;

        progressPercent.textContent =
            `${percent}%`;

        progressBar.style.width =
            `${percent}%`;
    }

    /* =====================================================
       VALIDATION
       ===================================================== */

    function validateCurrentStep() {

        if (currentStep === 1) {
            return validateOrganization();
        }

        if (currentStep === 2) {
            return validateYesNoSection(
                "self-assessment-questions"
            );
        }

        if (currentStep === 3) {
            return validateCryptoInventory();
        }

        if (currentStep === 4) {
            return validateRiskRegister();
        }

        if (currentStep === 5) {
            return validateVendorAssessment();
        }

        return true;
    }

function validateOrganization() {

    const organizationName =
        document.getElementById(
            "organization-name"
        );

    const contact =
        document.getElementById(
            "assessment-contact"
        );

    if (!organizationName) {
        return true;
    }

    /* ---------------------------------------------
       ORGANIZATION NAME
       --------------------------------------------- */

    if (!organizationName.value.trim()) {

        showValidationMessage(
            organizationName,
            "Please enter the organization name."
        );

        return false;
    }

    clearValidationMessage(
        organizationName
    );


    /* ---------------------------------------------
       EMAIL ADDRESS
       --------------------------------------------- */

    if (
        !contact ||
        !contact.value.trim()
    ) {

        showValidationMessage(
            contact,
            "Please enter an email address."
        );

        return false;
    }

    if (
        !contact.checkValidity()
    ) {

        showValidationMessage(
            contact,
            "Please enter a valid email address."
        );

        return false;
    }

    clearValidationMessage(
        contact
    );


    /* ---------------------------------------------
       STORE CURRENT ASSESSMENT STATE
       --------------------------------------------- */

    assessment.organization.name =
        organizationName.value.trim();

    assessment.organization.contact =
        contact.value.trim();

    return true;
}
function validateYesNoSection(containerId) {

    const container =
        document.getElementById(containerId);

    if (!container) {
        return true;
    }

    const questions =
        Array.from(
            container.querySelectorAll(
                ".assessment-question[data-question-id]"
            )
        );

    let firstMissing = null;

    questions.forEach((question) => {

        const questionId =
            question.dataset.questionId;

        const selected =
            question.querySelector(
                `input[name="${CSS.escape(questionId)}"]:checked`
            );

        if (!selected) {

            /*
             * Highlight unanswered question
             */
            question.classList.add(
                "validation-error"
            );

            if (!firstMissing) {
                firstMissing = question;
            }

        } else {

            /*
             * Remove error once question
             * has been answered
             */
            question.classList.remove(
                "validation-error"
            );
        }
    });

    if (firstMissing) {

        firstMissing.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return false;
    }

    return true;
}

    function validateCryptoInventory() {

    const entries =
        Array.from(
            assetList?.querySelectorAll(
                ".asset-entry"
            ) || []
        );

    if (entries.length === 0) {
        return true;
    }

    let firstInvalid = null;

    entries.forEach((entry) => {

        const name =
            entry.querySelector(
                'input[name^="assetName-"]'
            );

        const crypto =
            entry.querySelector(
                'select[name^="assetCrypto-"]'
            );

        const isInvalid =
            !name?.value.trim() ||
            !crypto?.value;

        const existingMessage =
            entry.querySelector(
                ".entry-validation-message"
            );

        if (isInvalid) {

            entry.classList.add(
                "validation-error"
            );

            if (!existingMessage) {

                const message =
                    document.createElement("p");

                message.className =
                    "entry-validation-message";

                message.textContent =
                    "Please complete the required fields before continuing.";

                entry.appendChild(message);
            }

            if (!firstInvalid) {
                firstInvalid = entry;
            }

        } else {

            entry.classList.remove(
                "validation-error"
            );

            existingMessage?.remove();
        }
    });

    if (firstInvalid) {

        firstInvalid.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return false;
    }

    return true;
}

    function validateRiskRegister() {

    const entries =
        Array.from(
            riskList?.querySelectorAll(
                ".risk-entry"
            ) || []
        );

    if (entries.length === 0) {
        return true;
    }

    let firstInvalid = null;

    entries.forEach((entry) => {

        const name =
            entry.querySelector(
                'input[name^="riskAsset-"]'
            );

        const x =
            entry.querySelector(
                'input[name^="riskX-"]'
            );

        const y =
            entry.querySelector(
                'input[name^="riskY-"]'
            );

        const z =
            entry.querySelector(
                'input[name^="riskZ-"]'
            );

        const isInvalid =
            !name?.value.trim() ||
            x?.value === "" ||
            y?.value === "" ||
            z?.value === "";

        const existingMessage =
            entry.querySelector(
                ".entry-validation-message"
            );

        if (isInvalid) {

            entry.classList.add(
                "validation-error"
            );

            if (!existingMessage) {

                const message =
                    document.createElement("p");

                message.className =
                    "entry-validation-message";

                message.textContent =
                    "Please complete the required fields before continuing.";

                entry.appendChild(message);
            }

            if (!firstInvalid) {
                firstInvalid = entry;
            }

        } else {

            entry.classList.remove(
                "validation-error"
            );

            existingMessage?.remove();
        }
    });

    if (firstInvalid) {

        firstInvalid.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return false;
    }

    return true;
}

function validateVendorAssessment() {

    const container =
        document.getElementById(
            "vendor-assessment-questions"
        );

    if (!container) {
        return true;
    }

    /*
     * VA-01 is the free-text algorithm question.
     * It is NOT a Yes/No question and therefore
     * is excluded from this validation.
     */

    const questions =
        Array.from(
            container.querySelectorAll(
                '.assessment-question[data-question-id]:not([data-question-id="VA-01"])'
            )
        );

    let firstMissing = null;

    questions.forEach((question) => {

        const questionId =
            question.dataset.questionId;

        const selected =
            question.querySelector(
                `input[name="${CSS.escape(questionId)}"]:checked`
            );

        if (!selected) {

            /* Keep this question highlighted */
            question.classList.add(
                "validation-error"
            );

            if (!firstMissing) {
                firstMissing = question;
            }

        } else {

            /* Remove error only from this question */
            question.classList.remove(
                "validation-error"
            );
        }
    });

    if (firstMissing) {

        firstMissing.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return false;
    }

    return true;
}
    function showValidationMessage(
        element,
        message
    ) {

        clearValidationMessage(
            element
        );

        element.classList.add(
            "validation-error"
        );

        const messageElement =
            document.createElement("p");

        messageElement.className =
            "validation-message";

        messageElement.textContent =
            message;

        element.parentElement?.appendChild(
            messageElement
        );

        element.focus();
    }

    function clearValidationMessage(
        element
    ) {

        element.classList.remove(
            "validation-error"
        );

        const existing =
            element.parentElement?.querySelector(
                ".validation-message"
            );

        existing?.remove();
    }

    /* =====================================================
       ANSWER COLLECTION
       ===================================================== */

    function handleAnswerChange(event) {

        const target =
            event.target;

        if (!target) {
            return;
        }

        if (
            target.matches(
                'input[type="radio"]'
            )
        ) {
            const question =
    target.closest(
        ".assessment-question"
    );

question?.classList.remove(
    "validation-error"
);

            if (
                target.name.startsWith(
                    "SA-"
                )
            ) {

                assessment.selfAssessment[
                    target.name
                ] = target.value;
            }

            if (
                target.name.startsWith(
                    "VA-"
                )
            ) {

                if (
                    target.name ===
                    "VA-01"
                ) {

                    assessment.vendorAlgorithms =
                        target.value;

                } else {

                    assessment.vendorAssessment[
                        target.name
                    ] = target.value;
                }
            }
        }

        if (
            target.matches("select") &&
            target.name.startsWith(
                "assetCrypto-"
            )
        ) {

            collectCryptoInventory();
        }
    }

    function handleInputChange(event) {

        const target =
            event.target;

        if (!target) {
            return;
        }

        if (
            target.id ===
            "organization-name"
        ) {

            assessment.organization.name =
                target.value.trim();
        }

        if (
            target.id ===
            "assessment-contact"
        ) {

            assessment.organization.contact =
                target.value.trim();
        }

        if (
            target.name ===
            "VA-01"
        ) {

            assessment.vendorAlgorithms =
                target.value;
        }

        if (
            target.name.startsWith(
                "asset"
            )
        ) {

            collectCryptoInventory();
        }

        if (
            target.name.startsWith(
                "risk"
            )
        ) {

            collectRiskRegister();
        }
    }

    /* =====================================================
       CRYPTOGRAPHIC ASSET INVENTORY
       ===================================================== */

    let assetCounter = 1;

    function addCryptoAsset() {

        if (!assetList) {
            return;
        }

        const index =
            assetCounter++;

        const article =
            document.createElement(
                "article"
            );

        article.className =
            "asset-entry";

        article.dataset.assetIndex =
            index;

        article.innerHTML = `

            <div class="form-field">

                <label for="asset-name-${index}">
                    Asset / system
                </label>

                <input
                    id="asset-name-${index}"
                    name="assetName-${index}"
                    type="text"
                    placeholder="e.g. Customer API"
                >

            </div>


            <div class="form-field">

                <label for="asset-crypto-${index}">
                    Crypto-agile?
                </label>

                <select
                    id="asset-crypto-${index}"
                    name="assetCrypto-${index}"
                >

                    <option value="">
                        Select...
                    </option>

                    <option value="Yes">
                        Yes
                    </option>

                    <option value="No">
                        No
                    </option>

                </select>

            </div>


            <div class="form-field">

                <label for="asset-algorithm-${index}">
                    Current algorithm / technology
                </label>

                <input
                    id="asset-algorithm-${index}"
                    name="assetAlgorithm-${index}"
                    type="text"
                    placeholder="e.g. RSA-2048, ECC, AES"
                >

            </div>


            <div class="form-field">

                <label for="asset-notes-${index}">
                    Notes
                </label>

                <textarea
                    id="asset-notes-${index}"
                    name="assetNotes-${index}"
                    rows="3"
                    placeholder="Optional"
                ></textarea>

            </div>


            <button
                type="button"
                class="remove-entry-button"
                data-remove-asset="${index}"
            >
                Remove Asset
            </button>

        `;

        assetList.appendChild(
            article
        );

        bindRemoveAssetButton(
            article
        );

        article.querySelector(
            `#asset-name-${index}`
        )?.focus();
    }

    function bindRemoveAssetButton(
        container
    ) {

        const button =
            container.querySelector(
                "[data-remove-asset]"
            );

        button?.addEventListener(
            "click",
            () => {

                container.remove();

                collectCryptoInventory();
            }
        );
    }

    function collectCryptoInventory() {

        const entries =
            Array.from(
                assetList?.querySelectorAll(
                    ".asset-entry"
                ) || []
            );

        assessment.cryptoInventory =
            entries.map(
                (entry) => ({

                    asset:
                        entry.querySelector(
                            'input[name^="assetName-"]'
                        )?.value.trim() || "",

                    cryptoAgile:
                        entry.querySelector(
                            'select[name^="assetCrypto-"]'
                        )?.value || "",

                    algorithm:
                        entry.querySelector(
                            'input[name^="assetAlgorithm-"]'
                        )?.value.trim() || "",

                    notes:
                        entry.querySelector(
                            'textarea[name^="assetNotes-"]'
                        )?.value.trim() || ""

                })
            );
    }

    /* =====================================================
       QUANTUM RISK REGISTER
       ===================================================== */

    let riskCounter = 1;

    function addRiskAsset() {

        if (!riskList) {
            return;
        }

        const index =
            riskCounter++;

        const article =
            document.createElement(
                "article"
            );

        article.className =
            "risk-entry";

        article.dataset.riskIndex =
            index;

        article.innerHTML = `

            <div class="form-field">

                <label for="risk-asset-${index}">
                    Asset / system
                </label>

                <input
                    id="risk-asset-${index}"
                    name="riskAsset-${index}"
                    type="text"
                    placeholder="e.g. Identity Platform"
                >

            </div>


            <div class="risk-input-grid">

                <div class="form-field">

                    <label for="risk-x-${index}">
                        X
                    </label>

                    <input
                        id="risk-x-${index}"
                        name="riskX-${index}"
                        type="number"
                        min="0"
                        step="any"
                    >

                </div>


                <div class="form-field">

                    <label for="risk-y-${index}">
                        Y
                    </label>

                    <input
                        id="risk-y-${index}"
                        name="riskY-${index}"
                        type="number"
                        min="0"
                        step="any"
                    >

                </div>


                <div class="form-field">

                    <label for="risk-z-${index}">
                        Z
                    </label>

                    <input
                        id="risk-z-${index}"
                        name="riskZ-${index}"
                        type="number"
                        min="0"
                        step="any"
                    >

                </div>

            </div>


            <div class="form-field">

                <label for="risk-notes-${index}">
                    Notes
                </label>

                <textarea
                    id="risk-notes-${index}"
                    name="riskNotes-${index}"
                    rows="3"
                    placeholder="Optional"
                ></textarea>

            </div>


            <button
                type="button"
                class="remove-entry-button"
                data-remove-risk="${index}"
            >
                Remove Risk Asset
            </button>

        `;

        riskList.appendChild(
            article
        );

        bindRemoveRiskButton(
            article
        );

        article.querySelector(
            `#risk-asset-${index}`
        )?.focus();
    }

    function bindRemoveRiskButton(
        container
    ) {

        const button =
            container.querySelector(
                "[data-remove-risk]"
            );

        button?.addEventListener(
            "click",
            () => {

                container.remove();

                collectRiskRegister();
            }
        );
    }

    function calculateRiskFlag(
        x,
        y,
        z
    ) {

        return x + y > z;
    }

    function collectRiskRegister() {

        const entries =
            Array.from(
                riskList?.querySelectorAll(
                    ".risk-entry"
                ) || []
            );

        assessment.riskRegister =
            entries.map(
                (entry) => {

                    const x =
                        Number(
                            entry.querySelector(
                                'input[name^="riskX-"]'
                            )?.value || 0
                        );

                    const y =
                        Number(
                            entry.querySelector(
                                'input[name^="riskY-"]'
                            )?.value || 0
                        );

                    const z =
                        Number(
                            entry.querySelector(
                                'input[name^="riskZ-"]'
                            )?.value || 0
                        );

                    return {

                        asset:
                            entry.querySelector(
                                'input[name^="riskAsset-"]'
                            )?.value.trim() || "",

                        x,
                        y,
                        z,

                        atRisk:
                            calculateRiskFlag(
                                x,
                                y,
                                z
                            ),

                        notes:
                            entry.querySelector(
                                'textarea[name^="riskNotes-"]'
                            )?.value.trim() || ""

                    };
                }
            );
    }

    /* =====================================================
       SCORING ENGINE
       ===================================================== */

    function calculateScores() {

        collectCryptoInventory();

        collectRiskRegister();

        const selfScore =
            calculateSelfScore();

        const cryptoScore =
            calculateCryptoScore();

        const riskScore =
            calculateRiskScore();

        const vendorScore =
            calculateVendorScore();

        const overall =
            (
                selfScore *
                SCORING.selfWeight
            ) +
            (
                cryptoScore *
                SCORING.cryptoWeight
            ) +
            (
                riskScore *
                SCORING.riskWeight
            ) +
            (
                vendorScore *
                SCORING.vendorWeight
            );

        const status =
            getStatus(overall);

        assessment.results = {

            selfScore,

            cryptoScore,

            riskScore,

            vendorScore,

            overallScore:
                overall,

            status
        };

        return assessment.results;
    }

    function calculateSelfScore() {

        const answers =
            Object.values(
                assessment.selfAssessment
            );

        if (
            answers.length === 0
        ) {
            return 0;
        }

        const yesCount =
            answers.filter(
                (answer) =>
                    answer === "Yes"
            ).length;

        return yesCount / 16;
    }

    function calculateCryptoScore() {

        const assets =
            assessment.cryptoInventory;

        if (
            assets.length === 0
        ) {
            return 0;
        }

        const agileCount =
            assets.filter(
                (asset) =>
                    asset.cryptoAgile === "Yes"
            ).length;

        return agileCount /
            assets.length;
    }

    function calculateRiskScore() {

        const risks =
            assessment.riskRegister;

        if (
            risks.length === 0
        ) {
            return 0;
        }

        const notAtRisk =
            risks.filter(
                (risk) =>
                    risk.atRisk === false
            ).length;

        return notAtRisk /
            risks.length;
    }

    function calculateVendorScore() {

        const answers =
            Object.values(
                assessment.vendorAssessment
            );

        if (
            answers.length === 0
        ) {
            return 0;
        }

        const yesCount =
            answers.filter(
                (answer) =>
                    answer === "Yes"
            ).length;

        /*
         * VA-01 is deliberately excluded from
         * the Yes/No score because it is a
         * structured algorithm-support response.
         */

        return yesCount / 14;
    }

    function getStatus(score) {

        const band =
            STATUS_BANDS.find(
                (item) =>
                    score >= item.min &&
                    score <= item.max
            );

        return band?.label ||
            "NOT READY";
    }

    /* =====================================================
       RESULTS
       ===================================================== */

    function calculateAndShowResults() {

        if (
            !validateCurrentStep()
        ) {
            return;
        }

        const results =
            calculateScores();

        renderResults(
            results
        );

        showScreen(
            "results"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function renderResults(
        results
    ) {

        const overall =
            results.overallScore;

        overallScore.textContent =
            formatPercent(
                overall
            );

        readinessStatus.textContent =
            results.status;

        selfScoreElement.textContent =
            formatPercent(
                results.selfScore
            );

        cryptoScoreElement.textContent =
            formatPercent(
                results.cryptoScore
            );

        riskScoreElement.textContent =
            formatPercent(
                results.riskScore
            );

        vendorScoreElement.textContent =
            formatPercent(
                results.vendorScore
            );

        const organizationName =
            assessment.organization.name ||
            "Organization";

        resultsOrganization.textContent =
            `${organizationName} · Quantum Readiness Assessment`;

        resultsSummary.textContent =
            createSummary(
                overall,
                results.status
            );

        renderKeyGaps(
            results
        );

        renderRecommendations(
            results
        );
    }

    function createSummary(
        score,
        status
    ) {

        if (
            status ===
            "NOT READY"
        ) {

            return "Your assessment indicates that significant quantum-readiness work remains. Focus first on identifying critical cryptographic assets and reducing quantum-risk exposure.";
        }

        if (
            status ===
            "INITIAL READINESS"
        ) {

            return "Your organization has begun its quantum-readiness journey, but several areas require additional preparation and structured action.";
        }

        if (
            status ===
            "ADVANCING"
        ) {

            return "Your organization demonstrates meaningful quantum-readiness preparation. The next priority is closing the remaining gaps and strengthening migration readiness.";
        }

        return "Your assessment indicates a strong quantum-readiness posture across the measured areas. Continue validating crypto-agility, risk controls, and PQC vendor capabilities.";
    }

    function renderKeyGaps(
        results
    ) {

        if (
            !keyGapsElement
        ) {
            return;
        }

        const gaps = [];

        if (
            results.selfScore <
            0.60
        ) {

            gaps.push(
                "Organizational readiness is below 60%."
            );
        }

        if (
            results.cryptoScore <
            0.60
        ) {

            gaps.push(
                "Cryptographic asset crypto-agility coverage is below 60%."
            );
        }

        if (
            results.riskScore <
            0.60
        ) {

            gaps.push(
                "More than 40% of registered assets are flagged as at risk under the assessment's risk logic."
            );
        }

        if (
            results.vendorScore <
            0.60
        ) {

            gaps.push(
                "PQC vendor readiness responses are below 60%."
            );
        }

        if (
            assessment.vendorAlgorithms.trim()
        ) {

            gaps.push(
                `Vendor algorithm response captured: ${assessment.vendorAlgorithms.trim()}`
            );
        }

        if (
            gaps.length === 0
        ) {

            gaps.push(
                "No major scoring gaps were identified by the current threshold checks."
            );
        }

        keyGapsElement.innerHTML =
            gaps.map(
                (gap) =>
                    `<div class="result-item">${escapeHtml(gap)}</div>`
            ).join("");
    }

    function renderRecommendations(
        results
    ) {

        if (
            !recommendationsElement
        ) {
            return;
        }

        const recommendations = [];

        if (
            results.selfScore <
            0.60
        ) {

            recommendations.push(
                "Establish or strengthen an organizational quantum-readiness strategy and governance process."
            );
        }

        if (
            results.cryptoScore <
            0.60
        ) {

            recommendations.push(
                "Prioritize discovery of non-crypto-agile assets and establish a migration roadmap."
            );
        }

        if (
            results.riskScore <
            0.60
        ) {

            recommendations.push(
                "Review assets flagged as at risk and prioritize those with the highest business impact."
            );
        }

        if (
            results.vendorScore <
            0.60
        ) {

            recommendations.push(
                "Review PQC capabilities and quantum-readiness commitments across relevant technology vendors."
            );
        }

        if (
            recommendations.length === 0
        ) {

            recommendations.push(
                "Continue periodic reassessment as cryptographic inventories, vendors, standards, and quantum-risk assumptions evolve."
            );
        }

        recommendationsElement.innerHTML =
            recommendations.map(
                (item) =>
                    `<div class="result-item">${escapeHtml(item)}</div>`
            ).join("");
    }

    /* =====================================================
       RESTART
       ===================================================== */

    function restartAssessment() {

        window.location.reload();
    }

    /* =====================================================
       UTILITIES
       ===================================================== */

    function formatPercent(
        value
    ) {

        return `${
            Math.round(
                value * 100
            )
        }%`;
    }

    function createAssessmentId() {

        const timestamp =
            Date.now().toString(36);

        const random =
            Math.random()
                .toString(36)
                .slice(2, 7);

        return `QR-${timestamp}-${random}`
            .toUpperCase();
    }

    function escapeHtml(
        value
    ) {

        return String(value)
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }

    /* =====================================================
       START APPLICATION
       ===================================================== */

    init();

})();
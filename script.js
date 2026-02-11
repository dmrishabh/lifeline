document.addEventListener('DOMContentLoaded', () => {
    const dobInput = document.getElementById('dob');
    const downloadBtn = document.getElementById('downloadBtn');
    const percentageText = document.getElementById('percentageText');
    const progressBar = document.getElementById('progressBar');
    const captureArea = document.getElementById('captureArea');

    const LIFE_EXPECTANCY_YEARS = 70;
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365.25;

    function calculateProgress(dob) {
        const now = new Date();
        const birthDate = new Date(dob);
        
        if (isNaN(birthDate.getTime())) {
            return 0;
        }

        const diffTime = now - birthDate;
        const progress = (diffTime / (LIFE_EXPECTANCY_YEARS * MS_IN_YEAR)) * 100;
        
        return Math.min(Math.max(progress, 0), 100);
    }

    function updateUI() {
        const dob = dobInput.value;
        if (!dob) {
            percentageText.textContent = '0%';
            progressBar.style.width = '0%';
            downloadBtn.disabled = true;
            return;
        }

        const progress = calculateProgress(dob);
        const formattedProgress = progress.toFixed(1); // 1 decimal place

        
        // Custom Color Logic based on percentage
        // Start: #2b630d (Green) -> End: #8a0000 (Dark Red)
        // Interpolating in HSL for better transition
        const hue = 99 - (progress * 0.99); // 99 (Green) -> 0 (Red)
        const sat = 77 + (progress * 0.23); // 77% -> 100%
        const light = 22 + (progress * 0.05); // 22% -> 27% (keeping it dark/bold)
        
        const newColor = hslToHex(hue, sat, light);
        
        // Update CSS and Picker
        document.documentElement.style.setProperty('--graphic-color', newColor);
        document.getElementById('colorPicker').value = newColor;

        // Dynamic Footer Logic
        const remaining = (100 - progress).toFixed(1);
        const birthDate = new Date(dob);
        const age = new Date().getFullYear() - birthDate.getFullYear(); // Approximate age from year
        
        const footerText = document.getElementById('footerText');
        
        if (progress < 50) {
            const messages = [
                `Dude you just completed ${formattedProgress}% of your life. Still ${remaining}% remaining to make an impact on planet.`,
                `Only ${formattedProgress}% loading... Greatness takes time.`,
                `You have ${remaining}% left to figure out what you want to be when you grow up.`,
                `At ${formattedProgress}%, you are basically just getting started.`
            ];
            // Pick message based on day of month to keep it stable for the user's specific birthday
            const index = birthDate.getDate() % messages.length;
            footerText.textContent = messages[index];
        } else {
             const messages = [
                `Ohh you have already celebrated ${age} birthdays! Time flies.`,
                `Warning: ${formattedProgress}% complete. Please ensure you have backed up your memories.`,
                `${remaining}% relative battery remaining. Please activate 'Savor Every Moment' mode.`,
                `You've survived 100% of your bad days so far. Keep going.`
            ];
            const index = birthDate.getDate() % messages.length;
            footerText.textContent = messages[index];
        }
    }

    // Helper to convert HSL to Hex for the input
    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    dobInput.addEventListener('change', updateUI);
    dobInput.addEventListener('input', updateUI); // Real-time update

    // Color Picker Logic
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', (e) => {
        // Only update the graphic color variable
        document.documentElement.style.setProperty('--graphic-color', e.target.value);
    });

    // Position Selector Logic
    const positionSelector = document.getElementById('positionSelector');
    positionSelector.addEventListener('change', (e) => {
        if (e.target.value === 'below') {
            captureArea.classList.add('labels-below');
        } else {
            captureArea.classList.remove('labels-below');
        }
    });

    // Corner Radius Logic
    const radiusSelector = document.getElementById('radiusSelector');
    radiusSelector.addEventListener('input', (e) => {
        const radius = e.target.value;
        document.documentElement.style.setProperty('--corner-radius', `${radius}px`);
    });

    downloadBtn.addEventListener('click', () => {
        if (!dobInput.value) return;
        
        // Hide UI elements not meant for capture if any (none in captureArea)
        // Ensure background is transparent
        
        html2canvas(captureArea, {
            scale: 4, // High resolution (approx 300 DPI if base is ~72-96)
            backgroundColor: null, // Transparent background
            logging: false,
            width: captureArea.offsetWidth, // Ensure full width captured
            height: captureArea.offsetHeight
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'life-progress.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error('Export failed:', err);
            alert('Failed to generate image. Please try again.');
        });
    });
});

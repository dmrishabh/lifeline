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

        // Update the Bar and Text
        percentageText.textContent = `${formattedProgress}%`;
        progressBar.style.width = `${formattedProgress}%`;
        downloadBtn.disabled = false; // Enable download

        
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
        
        // Mobile Fix: Create a "Virtual Container" clone for export
        // This ensures the graphic is rendered at 800px fixed width regardless of device
        const original = document.getElementById('captureArea');
        const clone = original.cloneNode(true); // Deep clone

        // Apply styles to the clone to force specific dimensions and layout
        Object.assign(clone.style, {
            position: 'absolute',
            top: '-9999px',
            left: '-9999px',
            width: '800px', // Requirement: Fixed internal width
            maxWidth: 'none', // Override responsive constraint
            boxSizing: 'border-box', // Include padding in width
            margin: '0',
            zIndex: '-1',
            borderRadius: '12px' // Ensure container radius is preferred or reset
        });

        // Append to body to allow style computation
        document.body.appendChild(clone);

        html2canvas(clone, {
            scale: 4.125, // Requirement: High-Resolution Scale
            backgroundColor: null, // Requirement: Transparent
            logging: false,
            useCORS: true,
            windowWidth: 1920, // Mock Desktop Width to ensure Full styling (fonts, etc)
            width: 800, // Explicit capture width
            height: clone.offsetHeight // Maintain calculated height
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'life-progress.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Cleanup
            document.body.removeChild(clone);
        }).catch(err => {
            console.error('Export failed:', err);
            alert('Failed to generate image. Please try again.');
            if (document.body.contains(clone)) {
                document.body.removeChild(clone);
            }
        });
    });
});

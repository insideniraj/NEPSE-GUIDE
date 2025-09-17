// Telegram.js - Post-payment invite flow
// This script handles the post-payment process for inviting users to the Telegram channel

document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('payment-form');
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(paymentForm);
            const paymentInfo = {
                name: formData.get('name'),
                email: formData.get('email'),
                paymentMethod: formData.get('payment-method'),
                screenshot: formData.get('payment-screenshot')
            };
            
            // Validate form data
            if (!paymentInfo.name || !paymentInfo.email || !paymentInfo.paymentMethod) {
                showMessage('Please fill in all required fields', 'error');
                return;
            }
            
            if (!paymentInfo.screenshot && paymentInfo.paymentMethod !== 'qr') {
                showMessage('Please upload your payment screenshot', 'error');
                return;
            }
            
            // Show processing message
            showMessage('Processing your payment...', 'info');
            
            // Simulate payment verification (in a real app, this would be a server call)
            setTimeout(() => {
                // Show success message
                showMessage('Payment verified! Redirecting to Telegram invite...', 'success');
                
                // Show the Telegram invite section
                document.getElementById('telegram-invite').classList.remove('hidden');
                
                // Hide the payment form
                paymentForm.classList.add('hidden');
                
                // Scroll to the Telegram invite section
                document.getElementById('telegram-invite').scrollIntoView({
                    behavior: 'smooth'
                });
            }, 2000);
        });
    }
});

// Show message to user
function showMessage(message, type) {
    const messageElement = document.getElementById('payment-message');
    
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = 'py-2 px-4 rounded text-white';
        
        // Set background color based on message type
        if (type === 'error') {
            messageElement.classList.add('bg-red-500');
        } else if (type === 'success') {
            messageElement.classList.add('bg-green-500');
        } else {
            messageElement.classList.add('bg-blue-500');
        }
        
        // Show the message
        messageElement.classList.remove('hidden');
        
        // Hide the message after 5 seconds for success and info messages
        if (type !== 'error') {
            setTimeout(() => {
                messageElement.classList.add('hidden');
            }, 5000);
        }
    }
}

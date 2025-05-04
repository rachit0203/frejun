/**
 * FreJun Website JavaScript
 */

(function($) {
    'use strict';

    // Debounce function to limit execution of expensive operations
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Document ready shorthand
    $(function() {
        initializeSite();
    });

    // Initialize all site functionality
    function initializeSite() {
        setupBanner();
        setupNavigation();
        setupModals();
        setupTabs();
        setupCalculator();
        setupForms();
        setupPricing();
        setupFaq();
        setupSliders();
        setupAnimations();
        attachEventListeners();
    }

    // Sticky Banner
    function setupBanner() {
        $('.close-banner').on('click', function() {
            $('.sticky-cta-banner').slideUp();
            $('#masthead').addClass('banner-closed');
            
            // Update hero section padding
            $('.hero-section').css('padding-top', '150px');
            
            // Store in session storage
            sessionStorage.setItem('bannerClosed', 'true');
        });
        
        // Check if banner was closed previously
        if(sessionStorage.getItem('bannerClosed') === 'true') {
            $('.sticky-cta-banner').hide();
            $('#masthead').addClass('banner-closed');
            $('.hero-section').css('padding-top', '150px');
        }
    }

    // Navigation setup
    function setupNavigation() {
        // Mobile Menu Toggle
        $('.mobile-menu-toggle').on('click', function() {
            $('.menu').toggleClass('active');
            $(this).toggleClass('active');
            $('body').toggleClass('menu-open');
        });

        // Dropdown behavior - different for mobile vs desktop
        $('.dropdown-toggle').on('click', function(e) {
            const isMobile = window.innerWidth < 992;
            const $parent = $(this).parent();
            
            if (isMobile) {
                e.preventDefault();
                $parent.toggleClass('active');
                $(this).next('.dropdown-menu').slideToggle(300);
                
                // Close other open dropdowns
                $('.has-dropdown').not($parent).removeClass('active')
                    .find('.dropdown-menu').slideUp(300);
            }
        });

        // Handle desktop dropdown behavior with hover
        if (window.innerWidth >= 992) {
            $('.has-dropdown').hover(
                function() {
                    $(this).addClass('hover');
                    $(this).find('.dropdown-menu').stop(true, true).fadeIn(300);
                },
                function() {
                    $(this).removeClass('hover');
                    $(this).find('.dropdown-menu').stop(true, true).fadeOut(300);
                }
            );
        }

        // Close mobile menu when clicking outside
        $(document).on('click', function(e) {
            if (window.innerWidth < 992 && 
                !$(e.target).closest('.main-navigation').length && 
                $('.menu').hasClass('active')) {
                $('.menu').removeClass('active');
                $('.mobile-menu-toggle').removeClass('active');
                $('body').removeClass('menu-open');
            }
        });

        // Sticky Header
        const handleScroll = debounce(function() {
            const scrollPosition = $(window).scrollTop();
            const $header = $('#masthead');
            
            if (scrollPosition > 50) {
                $header.addClass('sticky');
            } else {
                $header.removeClass('sticky');
            }
        }, 10);

        $(window).on('scroll', handleScroll);
        // Initialize on page load
        handleScroll();
        
        // Smooth scrolling for anchor links
        $('a[href^="#"]:not(.dropdown-toggle)').on('click', function(e) {
            const target = $(this.hash);
            if (target.length) {
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top - 80
                }, 500);
                
                // Close mobile menu if open
                if ($('.menu').hasClass('active')) {
                    $('.menu').removeClass('active');
                    $('.mobile-menu-toggle').removeClass('active');
                }
            }
        });
    }

    // Solution Tabs
    function setupTabs() {
        $('.tab-button').on('click', function() {
            const tabId = $(this).data('tab');
            
            // Update ARIA attributes
            $('.tab-button').attr('aria-selected', 'false');
            $(this).attr('aria-selected', 'true');
            
            // Update active tab button
            $('.tab-button').removeClass('active');
            $(this).addClass('active');
            
            // Show the corresponding tab content with animation
            $('.tab-pane').removeClass('active').hide();
            $('#' + tabId).addClass('active').fadeIn(400);
        });
    }

    // Modal Handling
    function setupModals() {
        function openModal(modalId) {
            const $modal = $('#' + modalId);
            $modal.addClass('active');
            $('body').addClass('modal-open').css('overflow', 'hidden');
            
            // Set focus on first focusable element
            $modal.find('a, button, input, select, textarea').filter(':visible').first().focus();
            
            // For video modal, load iframe src
            if (modalId === 'video-modal') {
                const $iframe = $('#video-modal iframe');
                const dataSrc = $iframe.data('src');
                if ($iframe.attr('src') === 'about:blank' && dataSrc) {
                    $iframe.attr('src', dataSrc);
                }
            }
        }
        
        function closeModal() {
            const $activeModal = $('.modal.active');
            
            // If it's video modal, pause the video
            if ($('#video-modal').hasClass('active')) {
                const $iframe = $('#video-modal iframe');
                const src = $iframe.attr('src');
                if (src && src !== 'about:blank') {
                    $iframe.attr('src', 'about:blank');
                    setTimeout(() => $iframe.attr('src', src), 300);
                }
            }
            
            $activeModal.removeClass('active');
            $('body').removeClass('modal-open').css('overflow', '');
            
            // Return focus to trigger element if available
            if ($activeModal.data('trigger')) {
                $($activeModal.data('trigger')).focus();
            }
        }
        
        // Open demo modal
        $('.open-demo-modal').on('click', function(e) {
            e.preventDefault();
            $('#demo-modal').data('trigger', this);
            openModal('demo-modal');
            trackEvent('open_demo_modal', 'Engagement', 'Demo Request');
        });
        
        // Open video modal
        $('#video-trigger').on('click', function(e) {
            e.preventDefault();
            $('#video-modal').data('trigger', this);
            openModal('video-modal');
            trackEvent('play_video', 'Engagement', 'Product Demo');
        });
        
        // Close modal buttons
        $('.close-modal').on('click', function() {
            closeModal();
        });
        
        // Close modal when clicking outside
        $('.modal').on('click', function(e) {
            if ($(e.target).hasClass('modal')) {
                closeModal();
            }
        });
        
        // Close modal with escape key
        $(document).keydown(function(e) {
            if (e.key === "Escape" && $('.modal.active').length) {
                closeModal();
            }
        });
        
        // Trap focus in modal for accessibility
        $('.modal').on('keydown', function(e) {
            if (e.key === 'Tab') {
                const $focusable = $(this).find('a, button, input, select, textarea').filter(':visible');
                const $first = $focusable.first();
                const $last = $focusable.last();
                
                if (e.shiftKey && document.activeElement === $first[0]) {
                    e.preventDefault();
                    $last.focus();
                } else if (!e.shiftKey && document.activeElement === $last[0]) {
                    e.preventDefault();
                    $first.focus();
                }
            }
        });
        
        // Exit intent popup with improved detection
        setTimeout(function() {
            if (sessionStorage.getItem('exitShown') !== 'true') {
                let sensitivityThreshold = 20;
                
                // Mouse leave detection for desktop
                $(document).on('mouseleave', function(e) {
                    if (e.clientY < sensitivityThreshold && 
                        !$('.modal.active').length && 
                        !sessionStorage.getItem('exitShown')) {
                        openModal('exit-intent');
                        sessionStorage.setItem('exitShown', 'true');
                        trackEvent('exit_intent_shown', 'Engagement');
                    }
                });
                
                // For mobile, detect if user is about to leave
                let prevScrollPos = window.scrollY;
                const mobileExitCheck = debounce(function() {
                    const currentScrollPos = window.scrollY;
                    const scrollingUp = currentScrollPos < prevScrollPos;
                    const nearPageTop = currentScrollPos < 200;
                    
                    if (scrollingUp && nearPageTop && 
                        !$('.modal.active').length && 
                        !sessionStorage.getItem('exitShown')) {
                        openModal('exit-intent');
                        sessionStorage.setItem('exitShown', 'true');
                        trackEvent('exit_intent_shown', 'Engagement');
                    }
                    
                    prevScrollPos = currentScrollPos;
                }, 100);
                
                // Only attach on mobile
                if (window.innerWidth < 768) {
                    $(window).on('scroll', mobileExitCheck);
                }
            }
        }, 10000); // Wait 10 seconds before enabling exit intent
    }

    // ROI Calculator
    function setupCalculator() {
        // Update calculator UI when sliders change
        $('.slider').on('input', updateRoiCalculator);
        
        // Calculate button click
        $('.calculate-roi').on('click', function() {
            updateRoiCalculator(true); // true = animate results
            trackEvent('roi_calculated', 'Engagement', null, {
                'team_size': $('#team-size').val(),
                'calls_per_day': $('#calls-per-day').val()
            });
        });
        
        // Initialize calculator with default values
        updateRoiCalculator();
    }

    function updateRoiCalculator(animate = false) {
        // Get values from sliders
        const teamSize = parseInt($('#team-size').val());
        const callsPerDay = parseInt($('#calls-per-day').val());
        const hourlyRate = parseInt($('#avg-hourly-rate').val());
        
        // Update displayed values
        $('#team-size').siblings('.range-value').text(teamSize);
        $('#calls-per-day').siblings('.range-value').text(callsPerDay);
        $('#avg-hourly-rate').siblings('.range-value').text('$' + hourlyRate);
        
        // Calculate realistic results
        const timeSavedPerCall = 2; // minutes
        const totalCallsPerMonth = teamSize * callsPerDay * 22; // 22 working days
        const totalMinutesSaved = totalCallsPerMonth * timeSavedPerCall;
        const totalHoursSaved = Math.round(totalMinutesSaved / 60);
        
        const monthlySavings = Math.round(totalHoursSaved * hourlyRate);
        const conversionIncrease = 20 + Math.round(teamSize / 5); // Base 20% + bonus based on team size
        
        // Ensure conversion doesn't exceed 45%
        const finalConversion = Math.min(conversionIncrease, 45);
        
        // Update result values with animation if requested
        const $results = $('.result-value');
        
        if (animate) {
            animateValue($results.eq(0), totalHoursSaved, 'hours/month');
            animateValue($results.eq(1), monthlySavings, '$', '/month');
            animateValue($results.eq(2), finalConversion, '+', '%');
            
            $('.calculator-results').addClass('highlight');
            setTimeout(function() {
                $('.calculator-results').removeClass('highlight');
            }, 1200);
        } else {
            $results.eq(0).text(totalHoursSaved + ' hours/month');
            $results.eq(1).text('$' + monthlySavings.toLocaleString() + '/month');
            $results.eq(2).text('+' + finalConversion + '%');
        }
    }
    
    // Helper function to animate numeric values
    function animateValue($element, finalValue, prefix = '', suffix = '') {
        const startValue = 0;
        const duration = 1000; // 1 second
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = (finalValue - startValue) / steps;
        let currentValue = startValue;
        
        const timer = setInterval(function() {
            currentValue += increment;
            
            if (currentValue >= finalValue) {
                clearInterval(timer);
                currentValue = finalValue;
            }
            
            $element.text(prefix + Math.floor(currentValue).toLocaleString() + suffix);
        }, stepTime);
    }

    // Form Handling
    function setupForms() {
        // Form submissions
        $('form').on('submit', function(e) {
            e.preventDefault();
            
            // Get form type
            const formType = $(this).hasClass('demo-form') ? 'demo' : 
                             $(this).hasClass('signup-form') ? 'signup' : 'general';
            
            // Show loading state on button
            const $button = $(this).find('button[type="submit"]');
            const originalText = $button.text();
            $button.html('<i class="fas fa-spinner fa-spin"></i> Processing...').prop('disabled', true);
            
            // Form validation
            const isValid = validateForm(this);
            
            if (!isValid) {
                $button.html(originalText).prop('disabled', false);
                return;
            }
            
            // Simulate form submission with delay
            setTimeout(() => {
                $button.html(originalText).prop('disabled', false);
                
                // Show success message
                const successHTML = `
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        <h3>Success!</h3>
                        <p>${getSuccessMessage(formType)}</p>
                    </div>
                `;
                
                $(this).html(successHTML);
                
                // Track form submission
                trackEvent(formType + '_form_submitted', 'Conversion');
                
                // Close modal after delay for exit intent and demo forms
                if (formType !== 'general') {
                    setTimeout(() => {
                        $('.modal.active').removeClass('active');
                        $('body').removeClass('modal-open').css('overflow', '');
                    }, 3000);
                }
            }, 1500);
        });
    }
    
    // Form validation
    function validateForm(form) {
        let isValid = true;
        const $form = $(form);
        
        // Remove any previous error messages
        $form.find('.error-message').remove();
        $form.find('.input-error').removeClass('input-error');
        
        // Validate each required field
        $form.find('[required]').each(function() {
            const $field = $(this);
            const type = $field.attr('type');
            
            // Different validation based on field type
            if (type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test($field.val())) {
                    markError($field, 'Please enter a valid email address');
                    isValid = false;
                }
            } else if (type === 'tel') {
                const phoneRegex = /^[0-9+\-() ]{10,20}$/;
                if (!phoneRegex.test($field.val())) {
                    markError($field, 'Please enter a valid phone number');
                    isValid = false;
                }
            } else if ($field.val().trim() === '') {
                markError($field, 'This field is required');
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // Mark field as having an error
    function markError($field, message) {
        $field.addClass('input-error');
        $('<div class="error-message">' + message + '</div>').insertAfter($field);
    }
    
    // Get appropriate success message based on form type
    function getSuccessMessage(formType) {
        switch(formType) {
            case 'demo':
                return 'Your demo request has been received. A member of our team will contact you within 24 hours.';
            case 'signup':
                return 'Your free trial is ready to go! Check your email for login details.';
            default:
                return 'Your message has been sent successfully. We\'ll be in touch soon.';
        }
    }

    // Pricing Toggle
    function setupPricing() {
        $('#billing-toggle').on('change', function() {
            const isAnnual = $(this).prop('checked');
            const $prices = $('.price');
            const $periods = $('.period');
            
            if (isAnnual) {
                // Apply discount for annual billing
                updatePriceWithAnimation($prices.eq(0), 39, 31);
                updatePriceWithAnimation($prices.eq(1), 69, 55);
                updatePriceWithAnimation($prices.eq(2), 119, 95);
                
                // Update periods
                $periods.text('per user/month billed annually');
            } else {
                // Monthly prices
                updatePriceWithAnimation($prices.eq(0), 31, 39);
                updatePriceWithAnimation($prices.eq(1), 55, 69);
                updatePriceWithAnimation($prices.eq(2), 95, 119);
                
                // Update periods
                $periods.text('per user/month');
            }
            
            // Track pricing toggle
            trackEvent('pricing_toggle', 'Engagement', isAnnual ? 'annual' : 'monthly');
        });
    }
    
    // Animate price changes
    function updatePriceWithAnimation($element, oldPrice, newPrice) {
        $element.addClass('price-changing');
        
        setTimeout(() => {
            $element.text('$' + newPrice);
            $element.removeClass('price-changing');
        }, 300);
    }

    // FAQ Accordion
    function setupFaq() {
        $('.faq-question').on('click', function() {
            const $faqItem = $(this).parent();
            const $answer = $faqItem.find('.faq-answer');
            const $icon = $(this).find('i');
            
            // Close all other FAQs
            $('.faq-item').not($faqItem).removeClass('active')
                .find('.faq-answer').slideUp(300);
            $('.faq-item').not($faqItem).find('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
            
            // Toggle current FAQ
            $faqItem.toggleClass('active');
            $answer.slideToggle(300);
            $icon.toggleClass('fa-chevron-down fa-chevron-up');
            
            // Track FAQ interaction
            if ($faqItem.hasClass('active')) {
                const question = $(this).find('h3').text();
                trackEvent('faq_opened', 'Engagement', question);
            }
        });
        
        // Open first FAQ by default
        $('.faq-item:first .faq-question').click();
    }

    // Sliders
    function setupSliders() {
        setupLogoSlider();
        setupTestimonialsSlider();
    }
    
    // Logo Slider
    function setupLogoSlider() {
        const $logoSlider = $('.logo-slider');
        const $logoItems = $logoSlider.find('.logo-item');
        const totalItems = $logoItems.length;
        let currentIndex = 0;
        
        // Only setup if there are enough items
        if (totalItems <= 1) return;
        
        // Setup automatic rotation
        const logoInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 3000);
        
        // Navigation controls
        $('.slider-prev').on('click', function() {
            clearInterval(logoInterval);
            goToSlide(currentIndex - 1);
        });
        
        $('.slider-next').on('click', function() {
            clearInterval(logoInterval);
            goToSlide(currentIndex + 1);
        });
        
        // Dot navigation
        $('.slider-dots .dot').on('click', function() {
            clearInterval(logoInterval);
            goToSlide($(this).index());
        });
        
        // Function to go to specific slide
        function goToSlide(index) {
            // Handle wrapping
            if (index < 0) index = totalItems - 1;
            if (index >= totalItems) index = 0;
            
            // Update current index
            currentIndex = index;
            
            // Move slider items
            $logoItems.css({
                'transform': `translateX(-${currentIndex * 100}%)`
            });
            
            // Update dots
            $('.slider-dots .dot').removeClass('active')
                .eq(currentIndex % $('.slider-dots .dot').length).addClass('active');
        }
    }
    
    // Testimonials Slider
    function setupTestimonialsSlider() {
        const $slider = $('.testimonials-slider');
        const $items = $slider.find('.testimonial-item');
        const totalItems = $items.length;
        let currentIndex = 0;
        
        // Only setup if there are enough items
        if (totalItems <= 1) return;
        
        // Hide all items except the first one
        $items.not(':first').hide();
        
        // Auto rotate testimonials
        setInterval(() => {
            $items.eq(currentIndex).fadeOut(500, () => {
                currentIndex = (currentIndex + 1) % totalItems;
                $items.eq(currentIndex).fadeIn(500);
            });
        }, 5000);
    }

    // Animation on scroll
    function setupAnimations() {
        const animateElements = [
            '.solution-content', 
            '.feature-item', 
            '.integration-logo', 
            '.value-item',
            '.testimonial-item',
            '.calculator-container',
            '.plans-container'
        ].join(', ');
        
        // Initial check for elements in viewport
        animateVisibleElements();
        
        // Check on scroll with debounce
        $(window).on('scroll', debounce(animateVisibleElements, 50));
        
        // Function to animate elements that are in viewport
        function animateVisibleElements() {
            $(animateElements).each(function() {
                const $element = $(this);
                if (isElementInViewport($element) && !$element.hasClass('animated')) {
                    $element.addClass('animate animated');
                }
            });
        }
        
        // Helper to check if element is in viewport
        function isElementInViewport($element) {
            const windowHeight = $(window).height();
            const windowScrollTop = $(window).scrollTop();
            const elementTop = $element.offset().top;
            
            return (elementTop < (windowScrollTop + windowHeight - 100));
        }
    }

    // Track events (analytics)
    function trackEvent(eventName, category, label, extraParams) {
        if (typeof gtag !== 'undefined') {
            const eventParams = {
                'event_category': category,
            };
            
            if (label) eventParams.event_label = label;
            
            if (extraParams) {
                Object.keys(extraParams).forEach(key => {
                    eventParams[key] = extraParams[key];
                });
            }
            
            gtag('event', eventName, eventParams);
        }
        
        // Fallback tracking to console for development
        console.log('EVENT:', eventName, category, label, extraParams);
    }

    // Additional event listeners
    function attachEventListeners() {
        // Track CTA button clicks
        $('.primary-button, .secondary-button').on('click', function() {
            const ctaText = $(this).text().trim();
            const ctaLocation = getCtaLocation(this);
            
            trackEvent('cta_click', 'Conversion', ctaText, {
                'cta_location': ctaLocation
            });
        });
        
        // Feature item hover effect
        $('.feature-item').hover(
            function() {
                $(this).css('transform', 'translateY(-10px)');
            },
            function() {
                $(this).css('transform', 'translateY(0)');
            }
        );
        
        // Handle window resize for responsive adjustments
        $(window).on('resize', debounce(function() {
            // Recalculate any size-dependent elements
            if (window.innerWidth >= 992) {
                $('.dropdown-menu').css('display', '');
                $('.menu').removeClass('active');
                $('.mobile-menu-toggle').removeClass('active');
            }
        }, 250));
        
        // Show "back to top" button when scrolled down
        const $backToTop = $('<button>', {
            class: 'back-to-top',
            html: '<i class="fas fa-arrow-up"></i>',
            'aria-label': 'Back to top'
        }).appendTo('body');
        
        $(window).on('scroll', debounce(function() {
            if ($(window).scrollTop() > 500) {
                $backToTop.addClass('visible');
            } else {
                $backToTop.removeClass('visible');
            }
        }, 100));
        
        $backToTop.on('click', function() {
            $('html, body').animate({ scrollTop: 0 }, 500);
        });
    }
    
    // Helper to identify which section a CTA is in
    function getCtaLocation(element) {
        const $element = $(element);
        const $section = $element.closest('section');
        
        if ($section.length) {
            return $section.attr('class').split(' ')[0];
        }
        
        return 'unknown';
    }

})(jQuery); 
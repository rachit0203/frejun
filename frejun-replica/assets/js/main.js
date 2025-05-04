/**
 * FreJun Website JavaScript
 */

(function($) {
    'use strict';

    // Sticky Banner
    $('.close-banner').on('click', function() {
        $('.sticky-cta-banner').slideUp();
        $('#masthead').addClass('banner-closed');
        
        // Update hero section padding
        $('.hero-section').css('padding-top', '150px');
        
        // Store in session storage so it stays closed during session
        sessionStorage.setItem('bannerClosed', 'true');
    });
    
    // Check if banner was closed previously in this session
    if(sessionStorage.getItem('bannerClosed') === 'true') {
        $('.sticky-cta-banner').hide();
        $('#masthead').addClass('banner-closed');
        $('.hero-section').css('padding-top', '150px');
    }

    // Mobile Menu Toggle
    $('.mobile-menu-toggle').on('click', function() {
        $('.menu').toggleClass('active');
    });

    // Mobile Dropdown Menu Toggle
    $('.has-dropdown > a').on('click', function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            $(this).parent().toggleClass('active');
            $(this).siblings('.dropdown-menu').slideToggle(300);
        }
    });

    // Close mobile menu when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.main-navigation').length) {
            $('.menu').removeClass('active');
        }
    });

    // Smooth scrolling for anchor links
    $('a[href^="#"]:not(.has-dropdown > a)').on('click', function(e) {
        e.preventDefault();
        
        var target = $(this.hash);
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 500);
        }
    });

    // Solution Tabs
    $('.tab-button').on('click', function() {
        var tabId = $(this).data('tab');
        
        // Update active tab button
        $('.tab-button').removeClass('active');
        $(this).addClass('active');
        
        // Show the corresponding tab content
        $('.tab-pane').removeClass('active');
        $('#' + tabId).addClass('active');
    });

    // Modal Handling
    function openModal(modalId) {
        $('#' + modalId).addClass('active');
        $('body').css('overflow', 'hidden');
    }
    
    function closeModal() {
        $('.modal').removeClass('active');
        $('body').css('overflow', 'auto');
        
        // If it's video modal, pause the video
        if($('#video-modal').hasClass('active')) {
            var iframe = $('#video-modal iframe');
            var src = iframe.attr('src');
            iframe.attr('src', '');
            setTimeout(function() {
                iframe.attr('src', src);
            }, 100);
        }
    }
    
    // Open demo modal
    $('.open-demo-modal').on('click', function(e) {
        e.preventDefault();
        openModal('demo-modal');
        
        // Track this action for analytics
        if(typeof gtag !== 'undefined') {
            gtag('event', 'open_demo_modal', {
                'event_category': 'Engagement',
                'event_label': 'Demo Request'
            });
        }
    });
    
    // Open video modal
    $('#video-trigger').on('click', function() {
        var iframe = $('#video-modal iframe');
        var dataSrc = iframe.data('src');
        
        // Only set src when opening to prevent autoplay when page loads
        if(iframe.attr('src') === 'about:blank') {
            iframe.attr('src', dataSrc);
        }
        
        openModal('video-modal');
        
        // Track video view for analytics
        if(typeof gtag !== 'undefined') {
            gtag('event', 'play_video', {
                'event_category': 'Engagement',
                'event_label': 'Product Demo'
            });
        }
    });
    
    // Close modal buttons
    $('.close-modal').on('click', function() {
        closeModal();
    });
    
    // Close modal when clicking outside
    $('.modal').on('click', function(e) {
        if($(e.target).hasClass('modal')) {
            closeModal();
        }
    });
    
    // Close modal with escape key
    $(document).keydown(function(e) {
        if(e.key === "Escape" && $('.modal.active').length) {
            closeModal();
        }
    });
    
    // Demo form submission
    $('.demo-form').on('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        var formData = {
            name: $('#name').val(),
            email: $('#email').val(),
            company: $('#company').val(),
            phone: $('#phone').val(),
            teamType: $('#team-type').val(),
            message: $('#message').val()
        };
        
        // Show loading state
        var submitButton = $(this).find('button[type="submit"]');
        var originalText = submitButton.text();
        submitButton.html('<i class="fas fa-spinner fa-spin"></i> Processing...');
        submitButton.prop('disabled', true);
        
        // Simulate form submission (in a real site, this would be an AJAX call)
        setTimeout(function() {
            // Reset button
            submitButton.html(originalText);
            submitButton.prop('disabled', false);
            
            // Show success message
            $('.demo-form').html('<div class="success-message"><i class="fas fa-check-circle"></i><h3>Thank you!</h3><p>Your demo request has been received. A member of our team will contact you within 24 hours to schedule your personalized demonstration.</p></div>');
            
            // Track successful submission
            if(typeof gtag !== 'undefined') {
                gtag('event', 'demo_request_submitted', {
                    'event_category': 'Conversion',
                    'event_label': formData.teamType
                });
            }
            
            // Close modal after 3 seconds
            setTimeout(function() {
                closeModal();
            }, 3000);
        }, 1500);
    });
    
    // Exit intent popup
    function setupExitIntent() {
        // Only show once per session
        if(sessionStorage.getItem('exitShown') === 'true') {
            return;
        }
        
        // Detect when mouse leaves the window at the top
        $(document).on('mouseleave', function(e) {
            if(e.clientY < 20 && !$('.modal.active').length) {
                openModal('exit-intent-modal');
                sessionStorage.setItem('exitShown', 'true');
                
                // Track exit intent for analytics
                if(typeof gtag !== 'undefined') {
                    gtag('event', 'exit_intent_shown', {
                        'event_category': 'Engagement'
                    });
                }
            }
        });
    }
    
    // Don't setup exit intent immediately, wait for user to engage
    setTimeout(setupExitIntent, 10000);
    
    // Exit intent form submission
    $('.signup-form').on('submit', function(e) {
        e.preventDefault();
        
        var email = $('#exit-email').val();
        
        // Show loading state
        var submitButton = $(this).find('button[type="submit"]');
        var originalText = submitButton.text();
        submitButton.html('<i class="fas fa-spinner fa-spin"></i> Processing...');
        submitButton.prop('disabled', true);
        
        // Simulate form submission
        setTimeout(function() {
            // Reset button
            submitButton.html(originalText);
            submitButton.prop('disabled', false);
            
            // Show success message
            $('.signup-form').html('<div class="success-message"><i class="fas fa-check-circle"></i><h3>Success!</h3><p>Your discount code has been sent to your email. Check your inbox to claim your 30% off!</p></div>');
            
            // Track successful submission
            if(typeof gtag !== 'undefined') {
                gtag('event', 'exit_intent_conversion', {
                    'event_category': 'Conversion',
                    'event_label': email
                });
            }
            
            // Close modal after 3 seconds
            setTimeout(function() {
                closeModal();
            }, 3000);
        }, 1500);
    });
    
    // ROI Calculator
    function updateRoiCalculator() {
        // Get values from sliders
        var teamSize = $('#team-size').val();
        var callsPerDay = $('#calls-per-day').val();
        var hourlyRate = $('#avg-hourly-rate').val();
        
        // Update displayed values
        $('#team-size').siblings('.range-value').text(teamSize);
        $('#calls-per-day').siblings('.range-value').text(callsPerDay);
        $('#avg-hourly-rate').siblings('.range-value').text('$' + hourlyRate);
        
        // Calculate realistic results
        var timeSavedPerCall = 2; // minutes
        var totalCallsPerMonth = teamSize * callsPerDay * 22; // 22 working days
        var totalMinutesSaved = totalCallsPerMonth * timeSavedPerCall;
        var totalHoursSaved = Math.round(totalMinutesSaved / 60);
        
        var monthlySavings = Math.round(totalHoursSaved * hourlyRate);
        var conversionIncrease = 20 + Math.round(teamSize / 5); // Base 20% + bonus based on team size
        
        // Ensure conversion doesn't exceed 45%
        conversionIncrease = Math.min(conversionIncrease, 45);
        
        // Update result values
        $('.result-value').eq(0).text(totalHoursSaved + ' hours/month');
        $('.result-value').eq(1).text('$' + monthlySavings.toLocaleString() + '/month');
        $('.result-value').eq(2).text('+' + conversionIncrease + '%');
    }
    
    // Update calculator when sliders change
    $('.slider').on('input', updateRoiCalculator);
    
    // Calculate button click
    $('.calculate-roi').on('click', function() {
        updateRoiCalculator();
        
        // Highlight the results with animation
        $('.calculator-results').addClass('highlight');
        setTimeout(function() {
            $('.calculator-results').removeClass('highlight');
        }, 1000);
        
        // Track calculator usage
        if(typeof gtag !== 'undefined') {
            gtag('event', 'roi_calculated', {
                'event_category': 'Engagement',
                'team_size': $('#team-size').val(),
                'calls_per_day': $('#calls-per-day').val()
            });
        }
    });
    
    // Billing toggle for pricing
    $('#billing-toggle').on('change', function() {
        var isAnnual = $(this).prop('checked');
        
        if(isAnnual) {
            // Apply 20% discount for annual
            $('.price').eq(0).text('$23');
            $('.price').eq(1).text('$39');
            
            // Update periods
            $('.period').text('per user/month billed annually');
        } else {
            // Monthly prices
            $('.price').eq(0).text('$29');
            $('.price').eq(1).text('$49');
            
            // Update periods
            $('.period').text('per user/month');
        }
        
        // Track pricing toggle
        if(typeof gtag !== 'undefined') {
            gtag('event', 'pricing_toggle', {
                'event_category': 'Engagement',
                'billing_type': isAnnual ? 'annual' : 'monthly'
            });
        }
    });
    
    // FAQ accordion
    $('.faq-question').on('click', function() {
        var faqItem = $(this).parent();
        
        // Close all other FAQs
        $('.faq-item').not(faqItem).removeClass('active');
        
        // Toggle current FAQ
        faqItem.toggleClass('active');
        
        // Track FAQ interaction
        if(faqItem.hasClass('active')) {
            var question = $(this).find('h3').text();
            if(typeof gtag !== 'undefined') {
                gtag('event', 'faq_opened', {
                    'event_category': 'Engagement',
                    'event_label': question
                });
            }
        }
    });

    // Track CTA clicks
    function trackCtaClicks() {
        // Primary CTAs
        $('.primary-button').on('click', function() {
            var ctaText = $(this).text().trim();
            var ctaLocation = getCtaLocation(this);
            
            if(typeof gtag !== 'undefined') {
                gtag('event', 'cta_click', {
                    'event_category': 'Conversion',
                    'event_label': ctaText,
                    'event_location': ctaLocation
                });
            }
        });
        
        // Track hero CTA specifically
        $('#hero-cta').on('click', function() {
            if(typeof gtag !== 'undefined') {
                gtag('event', 'hero_cta_click', {
                    'event_category': 'Conversion',
                    'event_label': 'Primary Hero CTA'
                });
            }
        });
    }
    
    // Helper to identify where a CTA is located
    function getCtaLocation(element) {
        var $element = $(element);
        var $section = $element.closest('section');
        
        if($section.length) {
            return $section.attr('class').split(' ')[0];
        }
        
        return 'unknown';
    }

    // Logo Slider (basic carousel functionality without a plugin)
    function setupLogoSlider() {
        const logoSlider = $('.logo-slider');
        const logoItems = logoSlider.find('.logo-item');
        const totalItems = logoItems.length;
        
        if (totalItems > 5) {
            let currentIndex = 0;
            
            setInterval(function() {
                logoItems.eq(currentIndex).css('opacity', 0);
                currentIndex = (currentIndex + 1) % totalItems;
                logoItems.eq(currentIndex).css('opacity', 1);
            }, 3000);
        }
    }

    // Testimonials Slider (basic functionality without a plugin)
    function setupTestimonialsSlider() {
        const testimonialSlider = $('.testimonials-slider');
        const testimonialItems = testimonialSlider.find('.testimonial-item');
        const totalItems = testimonialItems.length;
        
        if (totalItems > 1) {
            // Hide all items except the first one
            testimonialItems.not(':first').hide();
            
            let currentIndex = 0;
            
            // Change testimonial every 5 seconds
            setInterval(function() {
                testimonialItems.eq(currentIndex).fadeOut(500, function() {
                    currentIndex = (currentIndex + 1) % totalItems;
                    testimonialItems.eq(currentIndex).fadeIn(500);
                });
            }, 5000);
        }
    }

    // Sticky Header
    function stickyHeader() {
        var header = $('#masthead');
        var scrollPosition = $(window).scrollTop();
        
        if (scrollPosition > 50) {
            header.addClass('sticky');
        } else {
            header.removeClass('sticky');
        }
    }

    // Feature item hover effect
    $('.feature-item').hover(
        function() {
            $(this).css('transform', 'translateY(-10px)');
        },
        function() {
            $(this).css('transform', 'translateY(0)');
        }
    );

    // Animation on scroll
    function animateOnScroll() {
        $('.solution-content, .feature-item, .integration-logo, .value-item').each(function() {
            var position = $(this).offset().top;
            var scrollPosition = $(window).scrollTop() + $(window).height() * 0.9;
            
            if (scrollPosition > position) {
                $(this).addClass('animate');
            }
        });
    }

    // Initialize functions on document ready
    $(document).ready(function() {
        // Initialize sliders
        setupLogoSlider();
        setupTestimonialsSlider();
        
        // Initialize first tab content
        $('#sales').addClass('active');
        
        // Setup ROI calculator with initial values
        updateRoiCalculator();
        
        // Setup CTA tracking
        trackCtaClicks();
        
        // Make first FAQ open by default
        $('.faq-item:first').addClass('active');
        
        // Call functions on scroll
        $(window).on('scroll', function() {
            stickyHeader();
            animateOnScroll();
        });
        
        // Call them once on page load
        stickyHeader();
        animateOnScroll();
    });

})(jQuery); 
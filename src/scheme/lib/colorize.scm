#lang scheme

(require colorize)

(provide (all-defined-out))

(define pg_n (lambda (num) (display (colorize (string-append (number->string num) "\n") 'green))))
(define pg_s (lambda (str) (display (colorize (string-append str "\n") 'green))))

(define py_n (lambda (num) (display (colorize (string-append (number->string num) "\n") 'yellow))))
(define py_s (lambda (str) (display (colorize (string-append str "\n") 'yellow))))

(define pr_n (lambda (num) (display (colorize (string-append (number->string num) "\n") 'red))))
(define pr_s (lambda (str) (display (colorize (string-append str "\n") 'red))))

(define pm_n (lambda (num) (display (colorize (string-append (number->string num) "\n") 'magenta))))
(define pm_s (lambda (str) (display (colorize (string-append str "\n") 'magenta))))

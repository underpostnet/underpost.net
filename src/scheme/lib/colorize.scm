#lang scheme

(require colorize)

(provide (all-defined-out))

(define pg_n (lambda (num) (display (colorize (string-append (number->string num) "\n") 'green))))
(define pg_s (lambda (str) (display (colorize (string-append str "\n") 'green))))

(define py_n (lambda (num) (display (colorize (string-append (number->string num) "\n") 'yellow))))
(define py_s (lambda (str) (display (colorize (string-append str "\n") 'yellow))))

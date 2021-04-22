#lang scheme

(provide (all-defined-out))

(define-syntax +set!
  (syntax-rules ()
    ((_ binding increment)
     (set! binding (+ binding increment)))))

; (+set! cont -1)

(define l (lambda (list) (length list)))

; (l (list "a" "b"))

(define ls (lambda (str) (string-length str)))

; (ls "ab")

(define-syntax push
  (syntax-rules ()
    ((_ expr var)
     (set! var (cons expr var)))))

; (define test_list (list))
; (push "a" test_list)
; (push "b" test_list)

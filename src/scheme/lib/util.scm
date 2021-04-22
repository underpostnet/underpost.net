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

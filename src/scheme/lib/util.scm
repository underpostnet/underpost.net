#lang scheme

(provide (all-defined-out))

(define-syntax +set!
  (syntax-rules ()
    ((_ binding increment)
     (set! binding (+ binding increment)))))

; (+set! cont -1)

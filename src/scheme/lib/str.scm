#lang scheme

(provide (all-defined-out))

(require dyoo-while-loop)

;-------------------------------------------------------------------------------
;-------------------------------------------------------------------------------

(define startsWith (lambda (str start_str_search)
  (define map_list_str (map string (string->list str)))
  (define map_list_start_str_search (map string (string->list start_str_search)))
  (define result #f)
  (define index 0)
  (define str_test "")
  (while (< index (length map_list_start_str_search))
        (set! str_test (string-append str_test (list-ref map_list_str index)))
        (if (equal? str_test start_str_search)
          (set! result #t) void
        )
        (set! index (+ index 1))
  )
  result
))

; (startsWith "0000XXXX" "0000")


;-------------------------------------------------------------------------------
;-------------------------------------------------------------------------------
















;-------------------------------------------------------------------------------
;-------------------------------------------------------------------------------

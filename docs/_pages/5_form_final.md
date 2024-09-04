---
layout: form
title: Information
pageNo: 5
forms:
  - to: jhvanderschee@gmail.com
    subject: New submission!
    redirect: /
    form_engine: formcarry
    placeholders: true
    fields: 
      - name: feedback_interesting
        input_type: html
        placeholder: Why did you find interesting, what did you notice about the prompts?
      - name: feedback_interesting
        input_type: textarea
        placeholder: your feedback
        required: false

      - name: feedback_decision
        input_type: html
        placeholder: When was it hard to decide?
      - name: feedback_decision
        input_type: textarea
        placeholder: your feedback
        required: false

      - name: feedback_skip
        input_type: html
        placeholder: When did you skip?
      - name: feedback_skip
        input_type: textarea
        placeholder: your feedback
        required: false

      - name: submit
        input_type: submit
        placeholder: Continue
        required: true
      - name: submit
        input_type: back
        placeholder: Back
        required: true
---
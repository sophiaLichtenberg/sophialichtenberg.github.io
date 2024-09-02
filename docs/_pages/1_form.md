---
layout: form
title: Information
pageNo: 1
forms:
  - to: jhvanderschee@gmail.com
    subject: New submission!
    redirect: /
    form_engine: formcarry
    placeholders: true
    fields: 
      - name: age
        input_type: html
        placeholder: Age
      - name: age
        input_type: radio
        placeholder: "< 18"
        required: true
      - name: age
        input_type: radio
        placeholder: 18-24
        required: true
      - name: age
        input_type: radio
        placeholder: 25-34
        required: true
      - name: age
        input_type: radio
        placeholder: 35-45
        required: true
      - name: age
        input_type: radio
        placeholder: ">45"
        required: true

      - name: sex
        input_type: html
        placeholder: Gender
      - name: sex
        input_type: radio
        placeholder: male
        required: true
      - name: sex
        input_type: radio
        placeholder: female
        required: true
      - name: sex
        input_type: radio
        placeholder: non-binary
        required: true
      - name: sex
        input_type: radio
        placeholder: Prefer to self-describe, below
        required: true
      - name: sex
        input_type: textarea
        placeholder: Self-describe
        required: false

      - name: background
        input_type: html
        placeholder: Background
      - name: background
        input_type: checkbox
        placeholder: I have a background in Computer Science/Artificial intelligence/Human Computer Interaction or related expierence 
        required: false
      - name: background
        input_type: checkbox
        placeholder: I have a background in Art/Design/Illustration or related expierence 
        required: false
      - name: background
        input_type: checkbox
        placeholder: I have a background in a different field, describe below
        required: false
      - name: background
        input_type: textarea
        placeholder: Other background, below
        required: true

      - name: prompt_experience
        input_type: html
        placeholder: Prompting Experience
      - name: prompt_experience
        input_type: checkbox
        placeholder: I have previous expierence with prompting LLM (ChatGPT, Gemini, Claude etc)
        required: false
      - name: prompt_experience
        input_type: checkbox
        placeholder: I have previous expierence with prompting Text to Image Models (Stable Diffusion, Midjourney, DALL-E etc)
        required: false
      - name: prompt_experience
        input_type: checkbox
        placeholder: I have previous expierence with prompting other models
        required: false
      - name: prompt_experience
        input_type: textarea
        placeholder: Other AI interaction experience, below
        required: false


      - name: prompt_experience_degree
        input_type: html
        placeholder: Prompting Experience Frequency
      - name: prompt_experience_degree
        input_type: radio
        placeholder: Once before
        required: false
      - name: prompt_experience_degree
        input_type: radio
        placeholder: Occasionally 
        required: false
      - name: prompt_experience_degree
        input_type: radio
        placeholder: Regulary 
        required: false
      - name: prompt_experience_degree
        input_type: radio
        placeholder: Daily 
        required: false
      - name: prompt_experience_degree
        input_type: textarea
        placeholder: More details about your personal experience with prompting Text-to-Image models
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
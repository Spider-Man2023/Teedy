<#import "../layout.ftl" as layout>
<@layout.email>
  <h2>${app_name} - ${messages['email.template.user_registration_approved.subject']}</h2>
  <p>${messages('email.template.user_registration_approved.hello', username)}</p>
  <p>${messages['email.template.user_registration_approved.approved']}</p>
  <p>${messages('email.template.user_registration_approved.account', email)}</p>
  <p>${messages['email.template.user_registration_approved.instruction']}</p>
</@layout.email>
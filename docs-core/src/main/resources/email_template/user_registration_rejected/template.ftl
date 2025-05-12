<#import "../layout.ftl" as layout>
<@layout.email>
  <h2>${app_name} - ${messages['email.template.user_registration_rejected.subject']}</h2>
  <p>${messages('email.template.user_registration_rejected.hello', username)}</p>
  <p>${messages['email.template.user_registration_rejected.rejected']}</p>
  <p>${messages('email.template.user_registration_rejected.reason', reason)}</p>
  <p>${messages['email.template.user_registration_rejected.contact']}</p>
</@layout.email>
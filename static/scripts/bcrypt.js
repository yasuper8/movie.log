console.log("scripts.js linked!");

$(document).ready(function(){

  // 
  // $('#signup-form').on('submit', function(e) {
  //   e.preventDefault();
  //
  //     // part of your code for this step:
  //     // select the form and serialize its data
  //     var signupData = $("#signup-form").serialize();
  //     console.log("signup data : ",signupData);
  //     // send POST request to /users with the form data
  //     $.post('/users', signupData, function(response){
  //       console.log(response);
  //     });
  //
  //   $.ajax({
  //     url: "/users",
  //     type: "POST",
  //     data: signupData,
  //     success: successSignup,
  //     error: errorSignup
  //   });
  //
  //   function successSignup(res) {
  //     console.log(res)
  //     // res.redirect('/users');
  //   };
  //
  //   function errorSignup(a,b,c) {
  //     console.log("error signup!")
  //
  //   };
  //
  //
  // });


}); //end ready

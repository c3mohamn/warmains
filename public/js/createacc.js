$(document).ready(function(){

    // variables for input values
    var createbutton = $("input[name=createaccount]");
    var username = $("input[name=userfield]");
    var pass1 = $("input[name=pass1field]");
    var pass2 = $("input[name=pass2field]");
    var email = $("input[name=emailfield]");

    // used to check if fields are valid.
    var create_disabled = true;
    var valid_username = false;
    var valid_pass1 = false;
    var valid_pass2 = false;
    var valid_email = false;

    // variables for invalid input messages.
    var username_msg = $("#no-username-1");
    var pass1_msg = $("#no-password-2");
    var pass2_msg = $("#no-password-3");
    var email_msg = $("#no-email");

    var regusername = /^[a-z0-9_-]{3,16}$/;
    var regpass = /^[a-z0-9_-]{6,18}$/;
    var regemail = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;

    // TODO: Check if username is taken.
    // ----------------------
    // functions used for enabling/disabling create button
    // ----------------------
    function check_username() {
        if (!username.val().toString().match(regusername))
            return false;
        else return true;
    }
    function check_pass1() {
        if (!pass1.val().toString().match(regpass))
            return false;
        else return true;
    }
    function check_pass2() {
        if (pass2.val() != pass1.val())
            return false;
        else return true;
    }
    function check_email() {
        if (!email.val().toString().match(regemail))
            return false;
        else return true;
    }

    function enable_button() {
        createbutton.prop("disabled", false);
        createbutton.css("background-color", "#6D3A00");
        createbutton.mouseover(function () {
            createbutton.css("background-color", "#A05600");
        });
        createbutton.mouseout(function () {
            createbutton.css("background-color", "#6D3A00");
        });
    }
    function disable_button() {
        createbutton.prop("disabled", true);
        createbutton.css("background-color", "gray");
    }
    // ----------------------
    // messages under input boxes when invalid
    // ----------------------
    username.blur(function() {
        username_msg.css("visibility", "visible");
        username_msg.html("");

        if (username.val().length == 0 || username.val() === null) {
            username_msg.html("Enter a user name please.");
            valid_username = false;
        } else if (username.val().length < 3) {
            username_msg.html("Usernames must be at least 3 characters long.");
            valid_username = false;
        } else if (!username.val().toString().match(regusername)) {
            username_msg.html("Invalid characters.");
            valid_username = false;
        } else {
            valid_username = true;
        }
    });

    pass1.blur(function() {
        pass1_msg.css("visibility", "visible");
        pass1_msg.html("");

        if (pass1.val().length < 6) {
            pass1_msg.html("Password must be at least 6 characters long.");
            valid_pass1 = false;
        } else if (!pass1.val().toString().match(regpass)) {
            pass1_msg.html("Only use valid characters and numbers.");
            valid_pass1 = false;
        } else {
            valid_pass1 = true;
        }
    });

    pass2.blur(function() {
        pass2_msg.css("visibility", "visible");
        pass2_msg.html("");

        if (pass2.val() != pass1.val()) {
            pass2_msg.html("Passwords do not match.");
            valid_pass2 = false;
        } else {
            valid_pass2 = true;
        }
    });

    email.blur(function() {
        email_msg.css("visibility", "visible");
        email_msg.html("");

        if (!check_email()) {
            email_msg.html("Invalid email.");
            valid_email = false;
        } else {
            valid_email = true;
        }
    });


    // ----------------------
    // Checking whether input is valid here.
    // ----------------------
    all_fields = "input[name=userfield], input[name=pass1field], \
                    input[name=pass2field], input[name=emailfield]";

    $(all_fields).on('input', function () {

        if (check_username() && check_pass1() &&
            check_pass2() && check_email())
            enable_button();
        else
            disable_button();

    });
    if (valid_username == true) {
        alert("username is valid!");
        createbutton.prop("disabled", false);
    }

    // disabling create account button until fields are filled out
    //createbutton.prop("disabled", true);
    //createbutton.css("background-color", "gray");
});

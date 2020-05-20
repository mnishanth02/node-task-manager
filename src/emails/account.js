const sgMail = require('@sendgrid/mail');
const sendgridApiKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendgridApiKey);

const sendWelcomeEmail = (email, name) => {
    try {
        sgMail.send({
            to: email,
            from: 'nishanth.murugan@gmail.com',
            subject: 'Thanks for Signing in',
            text: `Welcome to the App,  ${name}, let me know h ow you get along with us`
        })
    } catch (error) {
        console.log(error);
    }

}

const sendCancelationEmail = (email, name) => {

    try {
        sgMail.send({
            to: email,
            from: 'nishanth.murugan@gmail.com',
            subject: 'Sorry to see you Go!',
            text: `Goodbye!!, ${name},I ahve to see you back soon`
        })
    } catch (error) {
        console.log(error);
    }

}


module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}
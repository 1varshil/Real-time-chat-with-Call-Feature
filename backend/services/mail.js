import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service : "Gmail",
    host : "smtp.gmail.com",
    secure:false,
    port : 587,
    
    auth : {
        user : process.env.EMAIL,
        pass : process.env.PASSWORD
    }
})

/**
 * 
 * @param {email options} param0 
 * @returns 
 */

export const sendEmail = async ({to,from,subject , text,html}) => {
    try {
        const info =  transporter.sendMail({
        from: `"ABC Company" <${from}>`,
        to,
        subject,
        text,
        html
        });

        console.log("Email sent successfully :", info);
        return {
            success: true,
            messageId : info.messageId
        }
    } catch (error) {
                return {
            success: false,
            error: error.message
            };
    }
}
// services/aws-notifications.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sesClient = new SESClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1',
});

const snsClient = new SNSClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1',
});

export const sendOrderEmail = async (toEmail: string, orderId: string, orderDetails: any) => {
    const params = {
        Source: process.env.NEXT_PUBLIC_SES_SENDER_EMAIL!,
        Destination: { ToAddresses: [toEmail] },
        Message: {
            Subject: { Data: `Order #${orderId} Confirmation - Ecommerce` },
            Body: {
                Html: {
                    Data: `
            <h1>Order Confirmed! 🎉</h1>
            <p>Thank you for your purchase.</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount:</strong> ₹${orderDetails.totalAmount}</p>
            <p>We'll notify you when your order ships.</p>
          `,
                },
            },
        },
    };

    const command = new SendEmailCommand(params);
    return sesClient.send(command);
};

export const sendOrderSMS = async (phone: string, orderId: string, orderDetails: any) => {
    const params = {
        Message: `Order #${orderId} confirmed! Amount: ₹${orderDetails.totalAmount}. Thank you for shopping!`,
        PhoneNumber: phone,
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                DataType: 'String',
                StringValue: 'Ecommerce',
            },
        },
    };

    const command = new PublishCommand(params);
    return snsClient.send(command);
};

export const sendOrderNotifications = async (email: string, phone: string, orderId: string, orderDetails: any) => {
    const [emailRes, smsRes] = await Promise.allSettled([
        sendOrderEmail(email, orderId, orderDetails),
        sendOrderSMS(phone, orderId, orderDetails),
    ]);

    console.log('Notifications sent:', { emailRes, smsRes });
    return { emailRes, smsRes };
};


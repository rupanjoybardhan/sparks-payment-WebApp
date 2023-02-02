const express = require("express");
const paypal = require("paypal-rest-sdk");

const PORT = process.env.PORT || 3000

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id: "AUOw69ujmfnw7Y-ZKnaKgliVjHQxMsWHw5x3h3iDAoH9cTOBgX3XZ8kZpg-QPf1XUUVnB7pdG3VLT4kk",
    client_secret: "EDW6rKARGF64bocwCah3lHIyx-dTv55kZjnLH2DygwvZwmg8lNyJxOww_N0bFSInlyfgERmx2Mw3-Jzb",
});

const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => res.sendFile(__dirname + "/index_2.html"));

app.post("/pay", (req, res) => {
    const create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal",
        },
        redirect_urls: {
            return_url: "https://rupanjoybardhan.github.io/Success-page-new/",
            cancel_url: "http://localhost:3000/cancel",
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: "Red Sox Hat",
                            sku: "001",
                            price: "5.00",
                            currency: "USD",
                            quantity: 1,
                        },
                    ],
                },
                amount: {
                    currency: "USD",
                    total: "5.00",
                },
                description: "Hat for the best team ever",
            },
        ],
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});

app.get("/success", (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        payer_id: payerId,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "5.00",
                },
            },
        ],
    };

    paypal.payment.execute(
        paymentId,
        execute_payment_json,
        function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                console.log(JSON.stringify(payment));
                res.sendFile(__dirname + "/public/success.html");
            }
        }
    );
});
app.post("/success",function(req,res){
    res.redirect("/");
})

/*document.querySelector("input").addEventListener("click",function(){
    document.querySelector("h1").style.color="red";
});*/
app.get('/cancel', (req, res) => res.send('Cancelled'));
app.listen(PORT, () => console.log(`Server Started on ${PORT}`)); 
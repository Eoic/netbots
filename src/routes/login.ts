import express, { Request } from "express";
const router = express.Router();
import { User } from "./../models/User";
import { publicRoute } from "./publicRoute";

router.get("/", publicRoute, (req: any, res: any) => {
    res.render("login", {
        title: "Login",
        active: { login: true },
    });
});

router.post("/", (req, res) => {
    User.findOne({ username: req.body.username }, "_id username password isAdmin identiconHash").then((user) => {
        if (user) {
            // tslint:disable-next-line: no-unused-expression
            // tslint:disable-next-line: variable-name
            (user as any).comparePasswords(req.body.password, (_err: any, success: any) => {
                if (success) {
                    (req as any).session.user = {
                        _id: user._id,
                        identiconHash: (user as any).identiconHash,
                        isAdmin: (user as any).isAdmin,
                        username: (user as any).username,
                    };

                    res.locals.authenticated = true;
                    res.redirect("/");
                } else {
                    handleErrors(res, ["Please check your username or password"]);
                }
            });
        } else {
            handleErrors(res, ["Please check your username or password"]);
        }
    });
});

function handleErrors(response: any, errors: any) {
    response.render("login", {
        errors,
        title: "Login",
    });
}

export { router as login };

import type { Request, Response } from "express";
import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

import { User } from "../models/userModel";

export const register = (req: Request, res: Response) => {
  try {
    console.log(req.body)
  const newUser = new User(req.body);
    const salt = bcrypt.genSaltSync(10);
  newUser.hash_password = bcrypt.hashSync(req.body.password, salt);

  newUser.save().then(user => {
    // do not return the hashed password
    user.hash_password = undefined;
    return res.json(user);
  })
  .catch(err => {
    return res.status(400).send({
      message:err
    });
  });
  } catch (err: any) {
    console.error(err);
    res.json(err.message)
  }
};

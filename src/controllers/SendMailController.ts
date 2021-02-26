import { Request, Response } from "express";
import { resolve } from "path";
import { title } from "process";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";

class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const userExists = await usersRepository.findOne({ email });

    if (!userExists) {
      return response.status(400).json({
        error: "User does not exists!",
      });
    }

    const survey = await surveysRepository.findOne({ id: survey_id });

    if (!survey) {
      return response.status(400).json({
        error: "Survey does not exists!",
      });
    }

    const npsMailPath = resolve(
      __dirname,
      "..",
      "views",
      "emails",
      "npsMail.hbs"
    );

    const variables = {
      name: userExists.name,
      title: survey.title,
      description: survey.description,
      user_id: userExists.id,
      link: process.env.URL_MAIL,
    };

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: [{ user_id: userExists.id }, { value: null }],
      relations: ["user", "survey"],
    });

    if (surveyUserAlreadyExists) {
      await SendMailService.execute(
        email,
        survey.title,
        variables,
        npsMailPath
      );
      return response.json(surveyUserAlreadyExists);
    }

    const surveyUser = surveysUsersRepository.create({
      user_id: userExists.id,
      survey_id,
    });
    await surveysUsersRepository.save(surveyUser);

    await SendMailService.execute(email, survey.title, variables, npsMailPath);

    return response.json(surveyUser);
  }
}

export { SendMailController };

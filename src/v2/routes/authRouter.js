const express = require("express");
const fs = require("fs");
const upload = require("../../middlewares/multer");
const logger = require("../../config/logger");
const { ResStatus } = require("../../utils/const");
const { sendJSONResponse } = require("../../utils/utils");
const {
	DuplicationException,
	RequestArgumentException,
	InvalidCredentialsException,
	UserNotFoundException,
} = require("../../exception/CustomException");

class AuthRouter {
	constructor(authService) {
		this.router = express.Router();
		this.authService = authService;
		this.#initializeRoutes();
	}

	#initializeRoutes() {
		this.router.post("/signup", upload.single("profileImg"), this.#signup.bind(this));
		this.router.post("/login", this.#login.bind(this));
		this.router.post("/logout", this.#logout.bind(this));
		this.router.post("/refresh", this.#refresh.bind(this));
	}

	async #signup(req, res) {
		const { email, password, nickname } = req.body;
		const profileImg = req.file;

		try {
			await this.authService.signup(email, password, nickname, profileImg);
			return sendJSONResponse(res, 201, ResStatus.SUCCESS, "회원가입이 성공적으로 완료되었습니다.");
		} catch (err) {
			/* 업로드된 파일 삭제 */
			if (fs.existsSync(profileImg.path)) {
				fs.rmSync(profileImg.path);
				logger.info(`[signup] 이미지 삭제: ${profileImg.path}`);
			}

			/* 커스텀 예외 처리 (500번 에러는 전역에서 처리) */
			if (err instanceof RequestArgumentException || err instanceof DuplicationException) {
				logger.error(err.message);
				return sendJSONResponse(res, err.statusCode, ResStatus.FAIL, err.message);
			}

			// 기타 에러
			throw err;
		}
	}

	async #login(req, res) {
		const { email, password } = req.body;

		try {
			const data = await this.authService.login(email, password);
			return sendJSONResponse(res, 200, ResStatus.SUCCESS, "로그인에 성공하였습니다.", data);
		} catch (err) {
			/* 커스텀 예외 처리 (500번 에러는 전역에서 처리) */
			if (err instanceof RequestArgumentException || err instanceof InvalidCredentialsException) {
				logger.error(err.message);
				return sendJSONResponse(res, err.statusCode, ResStatus.FAIL, err.message);
			}

			throw err;
		}
	}

	async #logout(req, res) {
		const { userId, refreshToken } = req.body;

		try {
			await this.authService.logout(userId, refreshToken);
			return sendJSONResponse(res, 200, ResStatus.SUCCESS, "로그아웃이 성공적으로 완료되었습니다.");
		} catch (err) {
			/* 커스텀 예외 처리 (500번 에러는 전역에서 처리) */
			if (err instanceof RequestArgumentException || err instanceof UserNotFoundException || err instanceof InvalidCredentialsException) {
				logger.error(err.message);
				return sendJSONResponse(res, err.statusCode, ResStatus.FAIL, err.message);
			}

			throw err;
		}
	}

	async #refresh(req, res) {
		const { userId, refreshToken } = req.body;

		try {
			const tokens = await this.authService.refresh(userId, refreshToken);
			return sendJSONResponse(res, 200, ResStatus.SUCCESS, "토큰이 성공적으로 재발행되었습니다.", tokens);
		} catch (err) {
			if (err instanceof RequestArgumentException || err instanceof InvalidCredentialsException) {
				logger.error(err.message);
				return sendJSONResponse(res, err.statusCode, ResStatus.FAIL, err.message);
			}

			throw err;
		}
	}
}

module.exports = AuthRouter;

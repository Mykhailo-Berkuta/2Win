const {
  AuthService,
  PredictionService,
  PredictionResult,
} = require("../src/predictionService");

// ─────────────────────────────────────────────
//  AuthService — register()
// ─────────────────────────────────────────────

describe("AuthService.register()", () => {
  test("TC-01: реєструє користувача з валідними даними", () => {
    // Technique: EP — позитивний клас (валідні email, пароль, isAdult=true)
    // Arrange
    const auth = new AuthService();
    // Act
    const user = auth.register("test@example.com", "password123", true);
    // Assert
    expect(user.email).toBe("test@example.com");
    expect(user.isAdult).toBe(true);
    expect(user.userId).toBe(1);
  });

  test("TC-02: кидає Error при неправильному форматі email", () => {
    // Technique: EP — негативний клас (email без @)
    // Arrange
    const auth = new AuthService();
    // Act & Assert
    expect(() => auth.register("invalidemail", "password123", true)).toThrow(
      "Invalid email format",
    );
  });

  test("TC-03: кидає Error при порожньому email", () => {
    // Technique: EP — негативний клас (email = '')
    // Arrange
    const auth = new AuthService();
    // Act & Assert
    expect(() => auth.register("", "password123", true)).toThrow(
      "Invalid email format",
    );
  });

  test("TC-04: кидає Error при паролі довжиною 5 символів (BVA: межа -1)", () => {
    // Technique: BVA — межа мін. довжини пароля (6), значення 5
    // Arrange
    const auth = new AuthService();
    // Act & Assert
    expect(() => auth.register("a@b.com", "12345", true)).toThrow(
      "Password must be at least 6 characters",
    );
  });

  test("TC-05: реєструє при паролі рівно 6 символів (BVA: точна межа)", () => {
    // Technique: BVA — мінімально допустима довжина пароля = 6
    // Arrange
    const auth = new AuthService();
    // Act
    const user = auth.register("a@b.com", "123456", true);
    // Assert
    expect(user).toBeDefined();
  });

  test("TC-06: кидає Error якщо isAdult = false", () => {
    // Technique: EP — негативний клас (неповнолітній)
    // Arrange
    const auth = new AuthService();
    // Act & Assert
    expect(() => auth.register("adult@b.com", "password", false)).toThrow(
      "User must be an adult",
    );
  });

  test("TC-07: кидає Error при повторній реєстрації з тим самим email", () => {
    // Technique: EP — негативний клас (дублікат email)
    // Arrange
    const auth = new AuthService();
    auth.register("dup@b.com", "pass123", true);
    // Act & Assert
    expect(() => auth.register("dup@b.com", "pass123", true)).toThrow(
      "Email already registered",
    );
  });
});

// ─────────────────────────────────────────────
//  AuthService — authenticate() та validateAge()
// ─────────────────────────────────────────────

describe("AuthService.authenticate()", () => {
  test("TC-08: повертає true при правильних credentials", () => {
    // Technique: EP — позитивний клас (існуючий user, вірний пароль)
    // Arrange
    const auth = new AuthService();
    auth.register("user@b.com", "mypassword", true);
    // Act
    const result = auth.authenticate("user@b.com", "mypassword");
    // Assert
    expect(result).toBe(true);
  });

  test("TC-09: повертає false при невірному паролі", () => {
    // Technique: EP — негативний клас (неправильний пароль)
    // Arrange
    const auth = new AuthService();
    auth.register("user@b.com", "mypassword", true);
    // Act
    const result = auth.authenticate("user@b.com", "wrongpass");
    // Assert
    expect(result).toBe(false);
  });

  test("TC-10: повертає false якщо email не існує", () => {
    // Technique: EP — негативний клас (незареєстрований email)
    // Arrange
    const auth = new AuthService();
    // Act
    const result = auth.authenticate("ghost@b.com", "any");
    // Assert
    expect(result).toBe(false);
  });

  test("TC-11: повертає false при порожніх аргументах", () => {
    // Technique: BVA — порожній рядок (межа валідного рядка)
    // Arrange
    const auth = new AuthService();
    // Act & Assert
    expect(auth.authenticate("", "")).toBe(false);
  });
});

describe("AuthService.validateAge()", () => {
  test("TC-12: повертає true при confirmed = true", () => {
    // Technique: EP — позитивний клас
    // Arrange
    const auth = new AuthService();
    // Act & Assert
    expect(auth.validateAge(true)).toBe(true);
  });

  test("TC-13: повертає false при confirmed = false", () => {
    // Technique: EP — негативний клас
    // Arrange
    const auth = new AuthService();
    // Act & Assert
    expect(auth.validateAge(false)).toBe(false);
  });

  test("TC-14: повертає false при confirmed = null (BVA: граничне nullish значення)", () => {
    // Technique: BVA — null як граничний nullish
    // Arrange
    const auth = new AuthService();
    // Act & Assert
    expect(auth.validateAge(null)).toBe(false);
  });
});

// ─────────────────────────────────────────────
//  PredictionService — calculateProbability()
// ─────────────────────────────────────────────

describe("PredictionService.calculateProbability()", () => {
  test("TC-15: повертає PredictionResult для upcoming матчу", () => {
    // Technique: EP — позитивний клас (status=upcoming, валідні рейтинги)
    // Arrange
    const ps = new PredictionService();
    const match = { status: "upcoming", homeRating: 70, awayRating: 50 };
    // Act
    const result = ps.calculateProbability(match);
    // Assert
    expect(result).toBeInstanceOf(PredictionResult);
    expect(
      result.homeWinProb + result.drawProb + result.awayWinProb,
    ).toBeCloseTo(1, 2);
  });

  test("TC-16: кидає Error для finished матчу", () => {
    // Technique: EP — негативний клас (status=finished)
    // Arrange
    const ps = new PredictionService();
    const match = { status: "finished", homeRating: 60, awayRating: 40 };
    // Act & Assert
    expect(() => ps.calculateProbability(match)).toThrow(
      "Prediction unavailable",
    );
  });

  test("TC-17: кидає Error якщо рейтинг < 0 (BVA: межа 0, значення -1)", () => {
    // Technique: BVA — рейтинг нижче мінімуму
    // Arrange
    const ps = new PredictionService();
    const match = { status: "upcoming", homeRating: -1, awayRating: 50 };
    // Act & Assert
    expect(() => ps.calculateProbability(match)).toThrow(
      "Ratings must be between 0 and 100",
    );
  });

  test("TC-18: кидає Error якщо рейтинг > 100 (BVA: межа 100, значення 101)", () => {
    // Technique: BVA — рейтинг вище максимуму
    // Arrange
    const ps = new PredictionService();
    const match = { status: "upcoming", homeRating: 50, awayRating: 101 };
    // Act & Assert
    expect(() => ps.calculateProbability(match)).toThrow(
      "Ratings must be between 0 and 100",
    );
  });

  test("TC-19: predict=home_win коли homeRating >> awayRating", () => {
    // Technique: EP — позитивний клас (явна перевага home)
    // Arrange
    const ps = new PredictionService();
    const match = { status: "upcoming", homeRating: 100, awayRating: 0 };
    // Act
    const result = ps.calculateProbability(match);
    // Assert
    expect(result.predictedOutcome).toBe("home_win");
  });

  test("TC-20: predict=away_win коли awayRating >> homeRating", () => {
    // Technique: EP — позитивний клас (явна перевага away)
    // Arrange
    const ps = new PredictionService();
    const match = { status: "upcoming", homeRating: 0, awayRating: 100 };
    // Act
    const result = ps.calculateProbability(match);
    // Assert
    expect(result.predictedOutcome).toBe("away_win");
  });

  test("TC-21: використовує дефолтний рейтинг 50 якщо не вказано", () => {
    // Technique: EP — позитивний клас (рейтинги відсутні → дефолт)
    // Arrange
    const ps = new PredictionService();
    const match = { status: "upcoming" };
    // Act
    const result = ps.calculateProbability(match);
    // Assert
    expect(result.homeWinProb).toBe(result.awayWinProb);
  });

  test("TC-22: кидає Error якщо match не є об'єктом", () => {
    // Technique: EP — негативний клас (null-значення)
    // Arrange
    const ps = new PredictionService();
    // Act & Assert
    expect(() => ps.calculateProbability(null)).toThrow(
      "Match object is required",
    );
  });
});

// ─────────────────────────────────────────────
//  PredictionService — fetchOdds()
// ─────────────────────────────────────────────

describe("PredictionService.fetchOdds()", () => {
  test("TC-23: повертає масив OddsEntry для матчу з odds", () => {
    // Technique: EP — позитивний клас (match з odds масивом)
    // Arrange
    const ps = new PredictionService();
    const match = {
      status: "upcoming",
      odds: [
        { bookmaker: "Bet365", homeOdds: 1.5, drawOdds: 3.2, awayOdds: 4.0 },
      ],
    };
    // Act
    const result = ps.fetchOdds(match);
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].bookmaker).toBe("Bet365");
  });

  test("TC-24: повертає порожній масив якщо odds відсутні (BVA: length=0)", () => {
    // Technique: BVA — порожній масив odds
    // Arrange
    const ps = new PredictionService();
    const match = { status: "upcoming", odds: [] };
    // Act
    const result = ps.fetchOdds(match);
    // Assert
    expect(result).toEqual([]);
  });

  test("TC-25: повертає порожній масив якщо поле odds відсутнє", () => {
    // Technique: EP — негативний клас (match без поля odds)
    // Arrange
    const ps = new PredictionService();
    const match = { status: "upcoming" };
    // Act
    const result = ps.fetchOdds(match);
    // Assert
    expect(result).toEqual([]);
  });

  test("TC-26: кидає Error якщо match=undefined у fetchOdds", () => {
    // Technique: EP — негативний клас (undefined замість об'єкта)
    // Arrange
    const ps = new PredictionService();
    // Act & Assert
    expect(() => ps.fetchOdds(undefined)).toThrow("Match object is required");
  });
});

// ─────────────────────────────────────────────
//  PredictionResult — getSummary()
// ─────────────────────────────────────────────

describe("PredictionResult.getSummary()", () => {
  test("TC-27: повертає форматований рядок з результатом", () => {
    // Technique: EP — позитивний клас (валідні дані)
    // Arrange
    const result = new PredictionResult({
      predictedOutcome: "home_win",
      confidence: 0.65,
      homeWinProb: 0.65,
      drawProb: 0.2,
      awayWinProb: 0.15,
    });
    // Act
    const summary = result.getSummary();
    // Assert
    expect(summary).toContain("home_win");
    expect(summary).toContain("65.0%");
  });
});

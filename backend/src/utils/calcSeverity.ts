import User from "../models/users";
import AppError from "../utils/AppError";

export async function updateRankings() {
  try {
    const users = await User.find().select("_id severityScore currentRank");

    // sort users in descending order
    const sortedUsers = users.sort((a, b) => b.severityScore - a.severityScore);

    // recalculate ranks and update users
    const bulkOps = sortedUsers.map((user, index) => ({
      updateOne: {
        filter: { _id: user._id },
        update: { currentRank: index + 1 },
      },
    }));

    await User.bulkWrite(bulkOps);

    return { message: "Severity score and rankings updated successfully" };
  } catch (error) {
    console.error("Error updating severity score and rankings:", error);
    throw new AppError("Error updating severity score and rankings: ", 500);
  }
}

export async function calculateSeverityScore(userEmail: string) {
  // from agent/model/coefficients.json
  const coeff = {
    intercept: 0.9999999999999813,
    heart_attack: 1.0519363158323358e-14,
    cardiomyopathy: 8.049116928532385e-16,
    heart_valve: 3.3306690738754696e-15,
    heart_defect: -3.0253577421035516e-15,
    age: 8.754932542820448e-18,
    bp: -1.496198998029996e-17,
  };

  try {
    if (!userEmail) {
      throw new AppError("User email is required", 400);
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { age, medicalDetails } = user;

    if (!age || !medicalDetails) {
      throw new AppError("User age or medical details are missing", 400);
    }

    const heartAttack = medicalDetails.heartAttack ? 1 : 0;
    const cardiomyopathy = medicalDetails.cardiomyopathy ? 1 : 0;
    const heart_valve = medicalDetails.heartValve ? 1 : 0;
    const heart_defect = medicalDetails.heartDefectByBirth ? 1 : 0;
    const bp: number = Number(medicalDetails.bloodPressure) || 0;

    const priorityScore =
      coeff.heart_attack * heartAttack +
      coeff.cardiomyopathy * cardiomyopathy +
      coeff.heart_valve * heart_valve +
      coeff.heart_defect * heart_defect +
      (100 - age) * coeff.age +
      (90 - bp) * coeff.bp;

    const minScore = -10; // Adjust based on expected minimum score
    const maxScore = 10; // Adjust based on expected maximum score

    const normalizedScore =
        ((priorityScore - minScore) / (maxScore - minScore)) * 100;

    // Ensure the score is within the 0-100 range
    const severityScore = Math.max(0, Math.min(100, normalizedScore));

    return severityScore;
  } catch (error) {
    console.error("Error calculating severity score:", error);
    throw new AppError("Error calculating severity score: ", 500);
  }
}

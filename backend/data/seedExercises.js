const mongoose = require('mongoose');
require('dotenv').config();

const Exercise = require('../models/Exercise');

const exercises = [
    // CHEST EXERCISES
    {
        name: 'Bench Press (Barbell)',
        category: 'Chest',
        primaryMuscles: ['Chest', 'Triceps'],
        secondaryMuscles: ['Shoulders'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            { step: 1, description: 'Lie flat on bench with feet firmly on the floor' },
            { step: 2, description: 'Grip barbell with hands slightly wider than shoulder-width' },
            { step: 3, description: 'Lower bar to chest with control' },
            { step: 4, description: 'Press bar up until arms are fully extended' }
        ],
        tips: ['Keep core tight throughout movement', 'Maintain natural arch in lower back']
    },
    {
        name: 'Incline Bench Press (Barbell)',
        category: 'Chest',
        primaryMuscles: ['Chest', 'Shoulders'],
        secondaryMuscles: ['Triceps'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            { step: 1, description: 'Set bench to 30-45 degree incline' },
            { step: 2, description: 'Lie back and grip barbell slightly wider than shoulders' },
            { step: 3, description: 'Lower bar to upper chest' },
            { step: 4, description: 'Press up and slightly back toward your face' }
        ]
    },
    {
        name: 'Dumbbell Bench Press',
        category: 'Chest',
        primaryMuscles: ['Chest', 'Triceps'],
        secondaryMuscles: ['Shoulders'],
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Lie on bench holding dumbbells at chest level' },
            { step: 2, description: 'Press weights up until arms are extended' },
            { step: 3, description: 'Lower with control back to starting position' }
        ]
    },
    {
        name: 'Push-ups',
        category: 'Chest',
        primaryMuscles: ['Chest', 'Triceps'],
        secondaryMuscles: ['Shoulders', 'Abs'],
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Start in plank position with hands under shoulders' },
            { step: 2, description: 'Lower body until chest nearly touches floor' },
            { step: 3, description: 'Push back up to starting position' }
        ]
    },
    {
        name: 'Dumbbell Flyes',
        category: 'Chest',
        primaryMuscles: ['Chest'],
        secondaryMuscles: ['Shoulders'],
        equipment: 'Dumbbell',
        difficulty: 'Intermediate',
        instructions: [
            { step: 1, description: 'Lie on bench with dumbbells extended above chest' },
            { step: 2, description: 'Lower weights in arc motion with slight bend in elbows' },
            { step: 3, description: 'Bring weights back together above chest' }
        ]
    },

    // BACK EXERCISES
    {
        name: 'Deadlift',
        category: 'Back',
        primaryMuscles: ['Back', 'Glutes', 'Hamstrings'],
        secondaryMuscles: ['Quadriceps', 'Abs'],
        equipment: 'Barbell',
        difficulty: 'Advanced',
        instructions: [
            { step: 1, description: 'Stand with feet hip-width apart, bar over mid-foot' },
            { step: 2, description: 'Bend at hips and knees to grip bar' },
            { step: 3, description: 'Lift by extending hips and knees' },
            { step: 4, description: 'Stand tall, then lower bar back down' }
        ],
        tips: ['Keep bar close to body', 'Maintain neutral spine']
    },
    {
        name: 'Pull-ups',
        category: 'Back',
        primaryMuscles: ['Back', 'Biceps'],
        secondaryMuscles: ['Shoulders'],
        equipment: 'Bodyweight',
        difficulty: 'Intermediate',
        instructions: [
            { step: 1, description: 'Hang from pull-up bar with overhand grip' },
            { step: 2, description: 'Pull body up until chin clears bar' },
            { step: 3, description: 'Lower with control to starting position' }
        ]
    },
    {
        name: 'Barbell Rows',
        category: 'Back',
        primaryMuscles: ['Back', 'Biceps'],
        secondaryMuscles: ['Shoulders'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            { step: 1, description: 'Bend forward at hips holding barbell' },
            { step: 2, description: 'Pull bar to lower chest/upper abdomen' },
            { step: 3, description: 'Lower bar with control' }
        ]
    },
    {
        name: 'Lat Pulldown',
        category: 'Back',
        primaryMuscles: ['Back', 'Biceps'],
        secondaryMuscles: ['Shoulders'],
        equipment: 'Machine',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Sit at lat pulldown machine with wide grip' },
            { step: 2, description: 'Pull bar down to upper chest' },
            { step: 3, description: 'Slowly return to starting position' }
        ]
    },
    {
        name: 'Dumbbell Rows',
        category: 'Back',
        primaryMuscles: ['Back', 'Biceps'],
        secondaryMuscles: ['Shoulders'],
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Place knee and hand on bench for support' },
            { step: 2, description: 'Row dumbbell to side of torso' },
            { step: 3, description: 'Lower weight with control' }
        ]
    },

    // SHOULDER EXERCISES
    {
        name: 'Overhead Press',
        category: 'Shoulders',
        primaryMuscles: ['Shoulders', 'Triceps'],
        secondaryMuscles: ['Abs'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            { step: 1, description: 'Stand with feet shoulder-width apart' },
            { step: 2, description: 'Press bar overhead until arms are extended' },
            { step: 3, description: 'Lower bar back to shoulder level' }
        ]
    },
    {
        name: 'Dumbbell Shoulder Press',
        category: 'Shoulders',
        primaryMuscles: ['Shoulders', 'Triceps'],
        secondaryMuscles: [],
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Sit or stand with dumbbells at shoulder height' },
            { step: 2, description: 'Press weights overhead' },
            { step: 3, description: 'Lower back to starting position' }
        ]
    },
    {
        name: 'Lateral Raises',
        category: 'Shoulders',
        primaryMuscles: ['Shoulders'],
        secondaryMuscles: [],
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Stand with dumbbells at sides' },
            { step: 2, description: 'Raise weights out to sides until parallel to floor' },
            { step: 3, description: 'Lower with control' }
        ]
    },

    // LEG EXERCISES
    {
        name: 'Squat (Barbell)',
        category: 'Quadriceps',
        primaryMuscles: ['Quadriceps', 'Glutes'],
        secondaryMuscles: ['Hamstrings', 'Abs'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            { step: 1, description: 'Position bar on upper back, feet shoulder-width apart' },
            { step: 2, description: 'Lower by bending at hips and knees' },
            { step: 3, description: 'Descend until thighs are parallel to floor' },
            { step: 4, description: 'Drive through heels to return to standing' }
        ],
        tips: ['Keep chest up', 'Track knees over toes']
    },
    {
        name: 'Romanian Deadlift',
        category: 'Hamstrings',
        primaryMuscles: ['Hamstrings', 'Glutes'],
        secondaryMuscles: ['Back'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            { step: 1, description: 'Stand with feet hip-width apart holding barbell' },
            { step: 2, description: 'Hinge at hips, lowering bar along legs' },
            { step: 3, description: 'Feel stretch in hamstrings, then return to standing' }
        ]
    },
    {
        name: 'Leg Press',
        category: 'Quadriceps',
        primaryMuscles: ['Quadriceps', 'Glutes'],
        secondaryMuscles: ['Hamstrings'],
        equipment: 'Machine',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Sit in leg press machine with feet on platform' },
            { step: 2, description: 'Lower weight by bending knees' },
            { step: 3, description: 'Push through heels to return to start' }
        ]
    },
    {
        name: 'Walking Lunges',
        category: 'Quadriceps',
        primaryMuscles: ['Quadriceps', 'Glutes'],
        secondaryMuscles: ['Hamstrings'],
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Step forward into lunge position' },
            { step: 2, description: 'Lower until both knees are at 90 degrees' },
            { step: 3, description: 'Step forward with back leg to next lunge' }
        ]
    },
    {
        name: 'Leg Curls',
        category: 'Hamstrings',
        primaryMuscles: ['Hamstrings'],
        secondaryMuscles: [],
        equipment: 'Machine',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Lie face down on leg curl machine' },
            { step: 2, description: 'Curl heels toward glutes' },
            { step: 3, description: 'Lower with control' }
        ]
    },
    {
        name: 'Calf Raises',
        category: 'Calves',
        primaryMuscles: ['Calves'],
        secondaryMuscles: [],
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Stand with balls of feet on elevated surface' },
            { step: 2, description: 'Rise up on toes as high as possible' },
            { step: 3, description: 'Lower heels below starting position' }
        ]
    },

    // ARM EXERCISES
    {
        name: 'Barbell Curls',
        category: 'Biceps',
        primaryMuscles: ['Biceps'],
        secondaryMuscles: ['Forearms'],
        equipment: 'Barbell',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Stand with feet shoulder-width apart holding barbell' },
            { step: 2, description: 'Curl bar up toward chest' },
            { step: 3, description: 'Lower with control' }
        ]
    },
    {
        name: 'Dumbbell Curls',
        category: 'Biceps',
        primaryMuscles: ['Biceps'],
        secondaryMuscles: ['Forearms'],
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Stand with dumbbells at sides' },
            { step: 2, description: 'Curl weights up to shoulders' },
            { step: 3, description: 'Lower slowly back to start' }
        ]
    },
    {
        name: 'Tricep Dips',
        category: 'Triceps',
        primaryMuscles: ['Triceps'],
        secondaryMuscles: ['Shoulders', 'Chest'],
        equipment: 'Bodyweight',
        difficulty: 'Intermediate',
        instructions: [
            { step: 1, description: 'Position hands on edge of bench or dip bars' },
            { step: 2, description: 'Lower body by bending elbows' },
            { step: 3, description: 'Push back up to starting position' }
        ]
    },
    {
        name: 'Close-Grip Bench Press',
        category: 'Triceps',
        primaryMuscles: ['Triceps', 'Chest'],
        secondaryMuscles: ['Shoulders'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
            { step: 1, description: 'Lie on bench with narrow grip on barbell' },
            { step: 2, description: 'Lower bar to chest keeping elbows close to body' },
            { step: 3, description: 'Press bar back up' }
        ]
    },
    {
        name: 'Hammer Curls',
        category: 'Biceps',
        primaryMuscles: ['Biceps', 'Forearms'],
        secondaryMuscles: [],
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Hold dumbbells with neutral grip (palms facing each other)' },
            { step: 2, description: 'Curl weights up keeping neutral grip' },
            { step: 3, description: 'Lower with control' }
        ]
    },

    // CORE/ABS EXERCISES
    {
        name: 'Plank',
        category: 'Abs',
        primaryMuscles: ['Abs'],
        secondaryMuscles: ['Shoulders', 'Back'],
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Start in push-up position on forearms' },
            { step: 2, description: 'Keep body in straight line from head to heels' },
            { step: 3, description: 'Hold position for desired time' }
        ]
    },
    {
        name: 'Crunches',
        category: 'Abs',
        primaryMuscles: ['Abs'],
        secondaryMuscles: [],
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Lie on back with knees bent, hands behind head' },
            { step: 2, description: 'Curl shoulders up toward knees' },
            { step: 3, description: 'Lower back down with control' }
        ]
    },
    {
        name: 'Russian Twists',
        category: 'Abs',
        primaryMuscles: ['Abs'],
        secondaryMuscles: [],
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Sit with knees bent, leaning back slightly' },
            { step: 2, description: 'Rotate torso from side to side' },
            { step: 3, description: 'Keep core engaged throughout movement' }
        ]
    },
    {
        name: 'Dead Bug',
        category: 'Abs',
        primaryMuscles: ['Abs'],
        secondaryMuscles: [],
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        instructions: [
            { step: 1, description: 'Lie on back with arms extended toward ceiling' },
            { step: 2, description: 'Extend opposite arm and leg simultaneously' },
            { step: 3, description: 'Return to start and repeat on other side' }
        ]
    }
];

// Function to seed the database
const seedExercises = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-tracker');
        
        console.log('Connected to MongoDB');
        
        // Clear existing exercises (optional - remove if you want to keep existing data)
        await Exercise.deleteMany({ isCustom: { $ne: true } });
        console.log('Cleared existing default exercises');
        
        // Insert exercises
        const insertedExercises = await Exercise.insertMany(exercises);
        console.log(`✅ Inserted ${insertedExercises.length} exercises successfully`);
        
        console.log('Exercise seeding completed!');
        
    } catch (error) {
        console.error('Error seeding exercises:', error);
    } finally {
        // Close connection
        mongoose.connection.close();
    }
};

// Run the seeding function if this file is executed directly
if (require.main === module) {
    seedExercises();
}

module.exports = { exercises, seedExercises };

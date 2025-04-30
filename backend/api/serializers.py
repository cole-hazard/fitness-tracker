from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    MuscleGroup, Exercise, Workout, WorkoutExercise, Plan,
    ExerciseMuscleActivation # Import the new model
)

class MuscleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleGroup
        fields = ['id', 'name']

class ExerciseMuscleActivationSerializer(serializers.ModelSerializer):
    # Include details about the muscle group itself (read-only in this nested context)
    muscle_group = MuscleGroupSerializer(read_only=True)
    # Allow setting muscle group by ID when creating/updating through Exercise
    muscle_group_id = serializers.PrimaryKeyRelatedField(
        queryset=MuscleGroup.objects.all(),
        source='muscle_group', # Map this input to the 'muscle_group' model field
        write_only=True
    )
    # Make activation level human-readable on read
    activation_level_display = serializers.CharField(source='get_activation_level_display', read_only=True)

    class Meta:
        model = ExerciseMuscleActivation
        fields = [
            'id',
            'muscle_group',         # Read-only nested object
            'muscle_group_id',      # Write-only ID
            'activation_level',     # Write ('H', 'M', 'L')
            'activation_level_display' # Read ('High', 'Medium', 'Low')
        ]
        # Ensure activation_level is writable, but display is read-only
        read_only_fields = ['id', 'muscle_group', 'activation_level_display']

class ExerciseSerializer(serializers.ModelSerializer):
    # Use the nested serializer for the through model relationship
    # 'muscle_activations' matches the related_name in ExerciseMuscleActivation model
    muscle_activations = ExerciseMuscleActivationSerializer(many=True)

    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'muscle_activations'] # Use the nested field

    # Add/Update create/update methods to handle nested writes for ExerciseMuscleActivation
    def create(self, validated_data):
        activations_data = validated_data.pop('muscle_activations')
        exercise = Exercise.objects.create(**validated_data)
        for activation_data in activations_data:
            # 'muscle_group' source handled by PrimaryKeyRelatedField
            ExerciseMuscleActivation.objects.create(exercise=exercise, **activation_data)
        return exercise

    def update(self, instance, validated_data):
        activations_data = validated_data.pop('muscle_activations', None)
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        if activations_data is not None:
            # Simple approach: Clear existing and add new ones
            # More complex logic needed for partial updates (PATCH) to avoid deleting/recreating unchanged items
            instance.muscle_activations.all().delete() # Use the related_name
            for activation_data in activations_data:
                ExerciseMuscleActivation.objects.create(exercise=instance, **activation_data)
        return instance

class WorkoutExerciseSerializer(serializers.ModelSerializer):
    # Include details about the exercise itself (now includes muscle activations)
    exercise = ExerciseSerializer(read_only=True)
    # Allow setting exercise by ID when creating/updating through Workout
    exercise_id = serializers.PrimaryKeyRelatedField(
        queryset=Exercise.objects.all(),
        source='exercise',
        write_only=True
    )

    class Meta:
        model = WorkoutExercise
        fields = ['id', 'exercise', 'exercise_id', 'target_sets', 'target_reps']

class WorkoutSerializer(serializers.ModelSerializer):
    # 'workout_exercises' matches related_name added to WorkoutExercise model
    workout_exercises = WorkoutExerciseSerializer(many=True)

    class Meta:
        model = Workout
        fields = ['id', 'name', 'description', 'workout_exercises']

    # create/update methods handle nested WorkoutExercise writes
    def create(self, validated_data):
        workout_exercises_data = validated_data.pop('workout_exercises')
        workout = Workout.objects.create(**validated_data)
        for item_data in workout_exercises_data:
            exercise = item_data.pop('exercise') # Handled by PrimaryKeyRelatedField source
            WorkoutExercise.objects.create(workout=workout, exercise=exercise, **item_data)
        return workout

    def update(self, instance, validated_data):
        workout_exercises_data = validated_data.pop('workout_exercises', None)
        # Update workout fields
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        if workout_exercises_data is not None:
            # Simple approach: Clear existing and add new ones
            instance.workout_exercises.all().delete() # Use related_name
            for item_data in workout_exercises_data:
                exercise = item_data.pop('exercise')
                WorkoutExercise.objects.create(workout=instance, exercise=exercise, **item_data)
        return instance

class PlanSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner = serializers.PrimaryKeyRelatedField(read_only=True) # Handled in view

    # Workout details now indirectly include exercise muscle activations
    day1_workout_details = WorkoutSerializer(source='day1_workout', read_only=True)
    day2_workout_details = WorkoutSerializer(source='day2_workout', read_only=True)
    day3_workout_details = WorkoutSerializer(source='day3_workout', read_only=True)
    day4_workout_details = WorkoutSerializer(source='day4_workout', read_only=True)
    day5_workout_details = WorkoutSerializer(source='day5_workout', read_only=True)
    day6_workout_details = WorkoutSerializer(source='day6_workout', read_only=True)
    day7_workout_details = WorkoutSerializer(source='day7_workout', read_only=True)

    class Meta:
        model = Plan
        fields = [
            'id', 'name', 'description', 'owner', 'owner_username', 'is_active',
            'day1_workout', 'day1_is_rest', 'day1_workout_details',
            'day2_workout', 'day2_is_rest', 'day2_workout_details',
            'day3_workout', 'day3_is_rest', 'day3_workout_details',
            'day4_workout', 'day4_is_rest', 'day4_workout_details',
            'day5_workout', 'day5_is_rest', 'day5_workout_details',
            'day6_workout', 'day6_is_rest', 'day6_workout_details',
            'day7_workout', 'day7_is_rest', 'day7_workout_details',
        ]
        read_only_fields = ['owner']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
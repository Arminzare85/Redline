
from rest_framework import serializers

from accounts.models import User, Profile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
        ]
        read_only_fields = ['id', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )

    password2 = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'password',
            'password2',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                'password2': 'Passwords do not match.'
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        Profile.objects.get_or_create(user=user)

        return user


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        source='user.email',
        read_only=True
    )

    first_name = serializers.CharField(
        source='user.first_name',
        required=True,
        allow_blank=False
    )

    last_name = serializers.CharField(
        source='user.last_name',
        required=False,
        allow_blank=True
    )

    class Meta:
        model = Profile
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'national_code',
            'phone_number',
            'birth_date',
            'province',
            'city',
            'postal_code',
            'address',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'email',
            'created_at',
            'updated_at',
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        for field, value in user_data.items():
            setattr(user, field, value)

        if user_data:
            user.save(update_fields=list(user_data.keys()))

        return super().update(instance, validated_data)

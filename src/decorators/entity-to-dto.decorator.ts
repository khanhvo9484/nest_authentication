import { createParamDecorator } from '@nestjs/common';

export const TransformEntityToDto =function createParamDecorator<T,U>(entity: T) {
    return entity;
}
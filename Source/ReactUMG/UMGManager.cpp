/*
 * Tencent is pleased to support the open source community by making Puerts available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
 * Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may
 * be subject to their corresponding license terms. This file is subject to the terms and conditions defined in file 'LICENSE',
 * which is part of this source code package.
 */

#include "UMGManager.h"
#include "Engine/Engine.h"
#include "Async/Async.h"

UReactWidget* UUMGManager::CreateReactWidget(UWorld* World)
{
    return NewObject<UReactWidget>(World, UReactWidget::StaticClass(), NAME_None, RF_Transactional);
}

UUserWidget* UUMGManager::CreateWidget(UWorld* World, UClass* Class)
{
    return ::CreateWidget<UUserWidget>(World, Class);
}

void UUMGManager::SynchronizeWidgetProperties(UWidget* Widget)
{
    Widget->SynchronizeProperties();
}

void UUMGManager::SynchronizeSlotProperties(UPanelSlot* Slot)
{
    Slot->SynchronizeProperties();
}

FOnReactRouteTo UUMGManager::OnReactRouteTo;
void UUMGManager::RouteTo(const FString& path)
{
    OnReactRouteTo.ExecuteIfBound(path);
}

void UUMGManager::SetReactRouteTo(const FOnReactRouteTo& path)
{
    OnReactRouteTo = path;
}

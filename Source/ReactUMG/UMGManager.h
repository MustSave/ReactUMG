/*
 * Tencent is pleased to support the open source community by making Puerts available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
 * Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may
 * be subject to their corresponding license terms. This file is subject to the terms and conditions defined in file 'LICENSE',
 * which is part of this source code package.
 */

#pragma once

#include "CoreMinimal.h"
#include "ReactWidget.h"
#include "Blueprint/UserWidget.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "GameFramework/PlayerController.h"
#include "UMGManager.generated.h"


DECLARE_DYNAMIC_DELEGATE_OneParam(FOnReactRouteTo, const FString&, path);

UCLASS()
class REACTUMG_API UUMGManager : public UBlueprintFunctionLibrary
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "Widget")
    static UReactWidget* CreateReactWidget(UWorld* World);

    UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "Widget")
    static UUserWidget* CreateWidget(UWorld* World, UClass* Class);

    UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "Widget")
    static void SynchronizeWidgetProperties(UWidget* Widget);

    UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "Widget")
    static void SynchronizeSlotProperties(UPanelSlot* Slot);

    UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "Widget")
    static void RouteTo(const FString& path);

    UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "Widget")
    static void SetReactRouteTo(const FOnReactRouteTo& path);

private:
    static FOnReactRouteTo OnReactRouteTo;
};

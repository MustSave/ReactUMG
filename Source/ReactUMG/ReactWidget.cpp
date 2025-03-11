/*
 * Tencent is pleased to support the open source community by making Puerts available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
 * Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may
 * be subject to their corresponding license terms. This file is subject to the terms and conditions defined in file 'LICENSE',
 * which is part of this source code package.
 */

#include "ReactWidget.h"

#include "Blueprint/GameViewportSubsystem.h"
#include "Blueprint/WidgetTree.h"
#include "Components/VerticalBoxSlot.h"


void UReactWidget::AddToViewport(int32 ZOrder)
{
#if WITH_EDITOR
    if (IsDesignTime())
    {
        return;
    }
#endif

    if (UGameViewportSubsystem* Subsystem = UGameViewportSubsystem::Get(GetWorld()))
    {
        FGameViewportWidgetSlot ViewportSlot;
        if (bIsManagedByGameViewportSubsystem)
        {
            ViewportSlot = Subsystem->GetWidgetSlot(this);
        }
        ViewportSlot.ZOrder = ZOrder;
        Subsystem->AddWidget(this, ViewportSlot);
    }
}

void UReactWidget::RemoveFromViewport()
{
#if WITH_EDITOR
    if (IsDesignTime())
    {
        return;
    }
#endif
    RemoveFromParent();
}

void UReactWidget::OnSlotAdded(UPanelSlot* InSlot)
{
     UVerticalBoxSlot* slot = Cast<UVerticalBoxSlot>(InSlot);
     slot->SetPadding(FMargin(0));
     slot->SetHorizontalAlignment(HAlign_Fill);
     slot->SetVerticalAlignment(VAlign_Fill);
     slot->SetSize(FSlateChildSize(ESlateSizeRule::Fill));
     Super::OnSlotAdded(InSlot);
}

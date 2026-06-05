import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Animated,
	Modal,
	PanResponder,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	useWindowDimensions,
	View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ActionDock } from '../components/ActionDock';
import { BottomSheetPanel } from '../components/BottomSheetPanel';
import { LearningHeader } from '../components/LearningHeader';
import { LearningCard } from '../components/LearningCard';
import { LearningSessionStrip } from '../components/LearningSessionStrip';
import {
	BoltIcon,
	CheckIcon,
	FilterIcon,
	KeyboardIcon,
	ReviewIcon,
} from '../../../shared/components/icons/AppIcons';
import { AnimatedBackdrop } from '../../../shared/components/AnimatedBackdrop';
import { useLearning } from '../context/LearningContext';
import { palette } from '../../../shared/theme/palette';
import { Card } from '../types/card';

const ALL_CATEGORIES_LABEL = 'Все темы';
const difficultyOptions = [
	{ key: 'all', label: 'Все уровни' },
	{ key: 'easy', label: 'Легко' },
	{ key: 'medium', label: 'Средне' },
	{ key: 'hard', label: 'Сложно' },
] as const;
const deckModeOptions = [
	{ key: 'all', label: 'Вся колода' },
	{ key: 'review', label: 'На повторе' },
] as const;

type DeckMode = (typeof deckModeOptions)[number]['key'];
type ManualFeedbackTone = 'success' | 'warning';
type ManualFeedback = {
	body: string;
	title: string;
	tone: ManualFeedbackTone;
} | null;
type ToastState = {
	body: string;
	title: string;
	tone: ManualFeedbackTone;
} | null;

function normalizeCommand(value: string) {
	return value
		.trim()
		.replace(/[“”]/g, '"')
		.replace(/[‘’]/g, "'")
		.replace(/\s*\|\s*/g, ' | ')
		.replace(/\s+/g, ' ')
		.toLowerCase();
}

function stripLeadingSudo(value: string) {
	return value.replace(/^sudo\s+/i, '');
}

function withSingleQuotes(value: string) {
	return value.replace(/"([^"]+)"/g, "'$1'");
}

function withoutSimpleQuotes(value: string) {
	return value.replace(/(["'])([^"'`\s]+)\1/g, '$2');
}

function buildAcceptedCommands(card: Card) {
	const variants = new Set<string>();
	const seedAnswers = [card.answer, ...(card.acceptedAnswers ?? [])];

	seedAnswers.forEach((answer) => {
		const localVariants = [
			answer,
			withSingleQuotes(answer),
			withoutSimpleQuotes(answer),
			withSingleQuotes(withoutSimpleQuotes(answer)),
		];

		localVariants.forEach((variant) => {
			const normalizedVariant = normalizeCommand(variant);

			if (!normalizedVariant) {
				return;
			}

			variants.add(normalizedVariant);

			if (/^sudo\s+/i.test(variant)) {
				variants.add(normalizeCommand(stripLeadingSudo(variant)));
			}
		});
	});

	return variants;
}

function evaluateManualAnswer(card: Card, value: string) {
	const normalizedValue = normalizeCommand(value);
	const normalizedAnswer = normalizeCommand(card.answer);

	if (!normalizedValue) {
		return {
			body: 'Введите ответ целиком, как если бы вы печатали его в терминале.',
			correct: false,
			title: 'Нужна команда',
		};
	}

	if (buildAcceptedCommands(card).has(normalizedValue)) {
		return {
			body: 'Хорошо. Такой ответ можно честно засчитать в уверенное знание.',
			correct: true,
			title: 'Верно',
		};
	}

	const inputTokens = normalizedValue.split(' ');
	const answerTokens = normalizedAnswer.split(' ');
	const sharedTokens = inputTokens.filter((token) =>
		answerTokens.includes(token),
	).length;
	const isCloseMatch =
		sharedTokens >= Math.max(answerTokens.length - 1, 1) ||
		normalizeCommand(stripLeadingSudo(card.answer)) === normalizedValue;

	if (isCloseMatch) {
		return {
			body: 'Основа верная. Проверьте один флаг, кавычки или последний аргумент.',
			correct: false,
			title: 'Почти получилось',
		};
	}

	return {
		body: 'Попробуйте еще раз, переверните карточку или отправьте ее на повтор.',
		correct: false,
		title: 'Пока мимо',
	};
}

function interleaveDeck(primaryCards: Card[], reviewCards: Card[], every = 3) {
	const deck: Card[] = [];
	let primaryIndex = 0;
	let reviewIndex = 0;

	while (
		primaryIndex < primaryCards.length ||
		reviewIndex < reviewCards.length
	) {
		for (
			let count = 0;
			count < every && primaryIndex < primaryCards.length;
			count += 1
		) {
			deck.push(primaryCards[primaryIndex]);
			primaryIndex += 1;
		}

		if (reviewIndex < reviewCards.length) {
			deck.push(reviewCards[reviewIndex]);
			reviewIndex += 1;
		}

		if (
			primaryIndex >= primaryCards.length &&
			reviewIndex < reviewCards.length
		) {
			deck.push(...reviewCards.slice(reviewIndex));
			break;
		}
	}

	return deck;
}

export function LearningScreen() {
	const {
		cards,
		isHydrated,
		markCardForReview,
		markCardKnown,
		progress,
		restart,
		reviewMeta,
		stats,
	} = useLearning();
	const tabBarHeight = useBottomTabBarHeight();
	const { height, width } = useWindowDimensions();
	const frameMaxWidth = width >= 768 ? 720 : undefined;
	const isCompactViewport = width < 390;
	const isDenseViewport = isCompactViewport || height < 760;
	const frameWidth =
		width >= 768
			? Math.min(width - 32, 720)
			: Math.max(width - (isCompactViewport ? 28 : 32), 0);
	const [selectedCategory, setSelectedCategory] =
		useState(ALL_CATEGORIES_LABEL);
	const [selectedDifficulty, setSelectedDifficulty] =
		useState<(typeof difficultyOptions)[number]['key']>('all');
	const [deckMode, setDeckMode] = useState<DeckMode>('all');
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [isAnswerSheetOpen, setIsAnswerSheetOpen] = useState(false);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [isCardFlipped, setIsCardFlipped] = useState(false);
	const [manualAnswer, setManualAnswer] = useState('');
	const [manualFeedback, setManualFeedback] = useState<ManualFeedback>(null);
	const [toastState, setToastState] = useState<ToastState>(null);
	const flipProgress = useRef(new Animated.Value(0)).current;
	const swipeOffset = useRef(new Animated.Value(0)).current;
	const toastOpacity = useRef(new Animated.Value(0)).current;
	const toastTranslateY = useRef(new Animated.Value(18)).current;
	const successGlow = useRef(new Animated.Value(0)).current;
	const warningGlow = useRef(new Animated.Value(0)).current;
	const isCardFlippedRef = useRef(false);
	const currentCardRef = useRef<Card | null>(null);
	const isCompletingSwipeRef = useRef(false);
	const toastTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);
	const swipeThreshold = 82;
	const exitDistance = 540;

	const categories = useMemo(
		() => [
			ALL_CATEGORIES_LABEL,
			...new Set(cards.map((card) => card.category)),
		],
		[cards],
	);

	const filteredCards = useMemo(
		() =>
			cards.filter((card) => {
				const categoryMatches =
					selectedCategory === ALL_CATEGORIES_LABEL ||
					card.category === selectedCategory;
				const difficultyMatches =
					selectedDifficulty === 'all' ||
					card.difficulty === selectedDifficulty;
				const deckModeMatches =
					deckMode === 'all' ? true : progress[card.id] === 'review';

				return categoryMatches && difficultyMatches && deckModeMatches;
			}),
		[cards, deckMode, progress, selectedCategory, selectedDifficulty],
	);

	const remainingCards = useMemo(() => {
		const reviewCards = [
			...filteredCards.filter((card) => progress[card.id] === 'review'),
		].sort((left, right) => {
			const reviewDiff =
				(reviewMeta[right.id]?.count ?? 0) - (reviewMeta[left.id]?.count ?? 0);

			if (reviewDiff !== 0) {
				return reviewDiff;
			}

			return (
				cards.findIndex((card) => card.id === left.id) -
				cards.findIndex((card) => card.id === right.id)
			);
		});

		if (deckMode === 'review') {
			return reviewCards;
		}

		const newCards = filteredCards.filter((card) => !(card.id in progress));
		return interleaveDeck(newCards, reviewCards, 3);
	}, [cards, deckMode, filteredCards, progress, reviewMeta]);

	const currentCard = remainingCards[0] ?? null;
	const nextCard = remainingCards[1] ?? null;
	const completedInFeed =
		deckMode === 'review'
			? filteredCards.length - remainingCards.length
			: filteredCards.filter((card) => progress[card.id] === 'known').length;
	const progressRatio =
		filteredCards.length === 0
			? 0
			: completedInFeed / Math.max(filteredCards.length, 1);
	const reviewCount = Object.values(progress).filter(
		(value) => value === 'review',
	).length;
	const activeFiltersCount =
		(selectedCategory === ALL_CATEGORIES_LABEL ? 0 : 1) +
		(selectedDifficulty === 'all' ? 0 : 1);
	const sessionIndex = Math.min(
		completedInFeed + 1,
		Math.max(filteredCards.length, 1),
	);
	const deckLabel =
		deckMode === 'review' ? 'Очередь повторения' : 'Основная колода';

	useEffect(() => {
		isCardFlippedRef.current = isCardFlipped;
	}, [isCardFlipped]);

	useEffect(() => {
		currentCardRef.current = currentCard;
	}, [currentCard]);

	useEffect(() => {
		setIsCardFlipped(false);
		isCardFlippedRef.current = false;
		flipProgress.setValue(0);
		swipeOffset.setValue(0);
		setManualAnswer('');
		setManualFeedback(null);
		setIsAnswerSheetOpen(false);
		setIsDetailsOpen(false);
	}, [currentCard?.id, flipProgress, swipeOffset]);

	useEffect(
		() => () => {
			if (toastTimerRef.current) {
				clearTimeout(toastTimerRef.current);
			}
		},
		[],
	);

	const pulseCardFeedback = (tone: ManualFeedbackTone) => {
		const animatedValue = tone === 'success' ? successGlow : warningGlow;
		animatedValue.stopAnimation();
		animatedValue.setValue(0);

		Animated.sequence([
			Animated.timing(animatedValue, {
				toValue: 1,
				duration: 140,
				useNativeDriver: true,
			}),
			Animated.timing(animatedValue, {
				toValue: 0,
				duration: 420,
				useNativeDriver: true,
			}),
		]).start();
	};

	const showToast = (tone: ManualFeedbackTone, title: string, body: string) => {
		if (toastTimerRef.current) {
			clearTimeout(toastTimerRef.current);
		}

		setToastState({ body, title, tone });
		toastOpacity.stopAnimation();
		toastTranslateY.stopAnimation();
		toastOpacity.setValue(0);
		toastTranslateY.setValue(18);

		Animated.parallel([
			Animated.timing(toastOpacity, {
				toValue: 1,
				duration: 180,
				useNativeDriver: true,
			}),
			Animated.spring(toastTranslateY, {
				toValue: 0,
				bounciness: 8,
				speed: 16,
				useNativeDriver: true,
			}),
		]).start();

		toastTimerRef.current = setTimeout(() => {
			Animated.parallel([
				Animated.timing(toastOpacity, {
					toValue: 0,
					duration: 180,
					useNativeDriver: true,
				}),
				Animated.timing(toastTranslateY, {
					toValue: 12,
					duration: 180,
					useNativeDriver: true,
				}),
			]).start(() => {
				setToastState(null);
			});
		}, 1750);
	};

	const resetCardPosition = () => {
		Animated.spring(swipeOffset, {
			toValue: 0,
			useNativeDriver: true,
			bounciness: 8,
			speed: 13,
		}).start();
	};

	const completeSwipe = (card: Card, direction: 'up' | 'down') => {
		if (isCompletingSwipeRef.current) {
			return;
		}

		isCompletingSwipeRef.current = true;
		pulseCardFeedback(direction === 'up' ? 'success' : 'warning');

		Animated.timing(swipeOffset, {
			toValue: direction === 'up' ? -exitDistance : exitDistance,
			duration: 220,
			useNativeDriver: true,
		}).start(() => {
			const action =
				direction === 'up'
					? markCardKnown(card.id)
					: markCardForReview(card.id);

			void action.finally(() => {
				showToast(
					direction === 'up' ? 'success' : 'warning',
					direction === 'up' ? '+10 XP' : 'Добавлено на повтор',
					direction === 'up'
						? 'Карточка ушла в уверенно знакомые.'
						: 'Команда вернется в поток раньше остальных.',
				);
				swipeOffset.setValue(0);
				isCompletingSwipeRef.current = false;
			});
		});
	};

	const setCardFace = (nextFlipped: boolean) => {
		if (isCompletingSwipeRef.current) {
			return;
		}

		isCardFlippedRef.current = nextFlipped;
		setIsCardFlipped(nextFlipped);

		Animated.spring(flipProgress, {
			toValue: nextFlipped ? 1 : 0,
			useNativeDriver: true,
			bounciness: 7,
			speed: 14,
		}).start();
	};

	const submitManualAnswer = async () => {
		if (!currentCard) {
			return;
		}

		const result = evaluateManualAnswer(currentCard, manualAnswer);

		if (result.correct) {
			setManualFeedback({
				body: result.body,
				title: result.title,
				tone: 'success',
			});
			pulseCardFeedback('success');
			await markCardKnown(currentCard.id, 'manual');
			showToast(
				'success',
				'+18 XP',
				'Отличный ручной ответ. Это лучший тип закрепления.',
			);
			closeAnswerSheet();
			return;
		}

		setManualFeedback({
			body: result.body,
			title: result.title,
			tone: 'warning',
		});
		pulseCardFeedback('warning');
	};

	const closeAnswerSheet = () => {
		setIsAnswerSheetOpen(false);
		setManualAnswer('');
		setManualFeedback(null);
	};

	const sendManualToReview = async () => {
		if (!currentCard) {
			return;
		}

		pulseCardFeedback('warning');
		await markCardForReview(currentCard.id, 'manual');
		showToast('warning', '+6 XP', 'Карточка ушла в повтор и вернется раньше.');
		closeAnswerSheet();
	};

	const clearFilters = () => {
		setSelectedCategory(ALL_CATEGORIES_LABEL);
		setSelectedDifficulty('all');
		setDeckMode('all');
		setIsFiltersOpen(false);
	};

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onMoveShouldSetPanResponder: (_, gestureState) =>
					!isCompletingSwipeRef.current &&
					Math.abs(gestureState.dy) > 8 &&
					Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
				onMoveShouldSetPanResponderCapture: (_, gestureState) =>
					!isCompletingSwipeRef.current &&
					Math.abs(gestureState.dy) > 8 &&
					Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
				onPanResponderGrant: () => {
					swipeOffset.stopAnimation();
				},
				onPanResponderMove: (_, gestureState) => {
					const nextValue = Math.max(Math.min(gestureState.dy, 188), -188);
					swipeOffset.setValue(nextValue);
				},
				onPanResponderRelease: (_, gestureState) => {
					const liveCard = currentCardRef.current;

					if (!liveCard) {
						resetCardPosition();
						return;
					}

					if (gestureState.dy <= -swipeThreshold) {
						completeSwipe(liveCard, 'up');
						return;
					}

					if (gestureState.dy >= swipeThreshold) {
						completeSwipe(liveCard, 'down');
						return;
					}

					resetCardPosition();
				},
				onPanResponderTerminate: resetCardPosition,
				onPanResponderTerminationRequest: () => false,
			}),
		[swipeOffset],
	);

	if (!isHydrated) {
		return (
			<SafeAreaView style={screenStyles.screen}>
				<AnimatedBackdrop />
				<View style={loaderStyles.loader}>
					<ActivityIndicator color={palette.accentStrong} size="large" />
					<Text style={loaderStyles.loader__text}>
						Собираем вашу учебную сессию...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (filteredCards.length === 0) {
		return (
			<SafeAreaView style={screenStyles.screen}>
				<AnimatedBackdrop />
				<View style={emptyStyles.empty}>
					<Text style={emptyStyles.empty__eyebrow}>
						{deckMode === 'review' ? 'Режим повторения' : 'Фильтры'}
					</Text>
					<Text style={emptyStyles.empty__title}>
						{deckMode === 'review'
							? 'Сейчас в очереди повторения пусто'
							: 'Под эти фильтры карточек пока нет'}
					</Text>
					<Text style={emptyStyles.empty__body}>
						{deckMode === 'review'
							? "Отмечайте команды как 'повторить', и здесь появится ваша персональная очередь."
							: 'Смените тему, уровень сложности или вернитесь к полной колоде.'}
					</Text>
					<Pressable
						onPress={clearFilters}
						style={emptyStyles.empty__primaryAction}
					>
						<Text style={emptyStyles.empty__primaryActionText}>
							Показать все карточки
						</Text>
					</Pressable>
				</View>
			</SafeAreaView>
		);
	}

	if (!currentCard) {
		return (
			<SafeAreaView style={screenStyles.screen}>
				<AnimatedBackdrop />
				<View style={emptyStyles.empty}>
					<Text style={emptyStyles.empty__eyebrow}>
						{deckMode === 'review'
							? 'Повторение завершено'
							: 'Сессия завершена'}
					</Text>
					<Text style={emptyStyles.empty__title}>
						{deckMode === 'review'
							? 'Очередь на повтор сейчас закрыта'
							: 'В этой подборке больше нет активных карточек'}
					</Text>
					<Text style={emptyStyles.empty__body}>
						{deckMode === 'review'
							? 'Хороший момент вернуться в общую колоду или пройти статистику и закрепить темп.'
							: 'Можно сменить фильтры, открыть блок повторения или полностью начать заново.'}
					</Text>

					<View style={emptyStyles.empty__statsRow}>
						<CompletionChip
							icon={<CheckIcon color={palette.accentStrong} size={18} />}
							label="Знаю"
							tone="success"
							value={stats.known}
						/>
						<CompletionChip
							icon={<ReviewIcon color="#f4a261" size={18} />}
							label="На повторе"
							tone="warning"
							value={stats.review}
						/>
					</View>

					<Pressable
						onPress={() => setDeckMode('review')}
						style={emptyStyles.empty__secondaryAction}
					>
						<Text style={emptyStyles.empty__secondaryActionText}>
							Открыть карточки на повторе
						</Text>
					</Pressable>
					<Pressable
						onPress={clearFilters}
						style={emptyStyles.empty__secondaryAction}
					>
						<Text style={emptyStyles.empty__secondaryActionText}>
							Сбросить режим и фильтры
						</Text>
					</Pressable>
					<Pressable
						onPress={() => void restart()}
						style={emptyStyles.empty__primaryAction}
					>
						<Text style={emptyStyles.empty__primaryActionText}>
							Начать всю колоду заново
						</Text>
					</Pressable>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={screenStyles.screen}>
			<AnimatedBackdrop />

			<View
				style={[
					screenStyles.screen__content,
					{ paddingBottom: tabBarHeight + (isDenseViewport ? 14 : 24) },
				]}
			>
				<View
					style={[
						screenStyles.screen__frame,
						isDenseViewport ? screenStyles.screen__frameCompact : null,
						{ width: frameWidth },
						frameMaxWidth ? { maxWidth: frameMaxWidth } : null,
					]}
				>
					<LearningHeader
						activeFiltersCount={activeFiltersCount}
						isCompact={isDenseViewport}
						onOpenFilters={() => setIsFiltersOpen(true)}
					/>

					<LearningSessionStrip
						isCompact={isDenseViewport}
						progressRatio={progressRatio}
						remainingCount={remainingCards.length}
						reviewCount={reviewCount}
						streak={stats.streak}
						xp={stats.xp}
					/>

					<LearningCard
						currentCard={currentCard}
						deckLabel={deckLabel}
						flipProgress={flipProgress}
						isCompact={isDenseViewport}
						isCardFlipped={isCardFlipped}
						nextCard={nextCard}
						onOpenDetails={() => setIsDetailsOpen(true)}
						onToggleFace={() => setCardFace(!isCardFlippedRef.current)}
						panHandlers={panResponder.panHandlers}
						sessionIndex={sessionIndex}
						sessionTotal={filteredCards.length}
						successGlow={successGlow}
						swipeOffset={swipeOffset}
						warningGlow={warningGlow}
					/>

					<ActionDock
						isCompact={isDenseViewport}
						onOpenManualAnswer={() => setIsAnswerSheetOpen(true)}
						onSendKnown={() => completeSwipe(currentCard, 'up')}
						onSendReview={() => completeSwipe(currentCard, 'down')}
					/>

					{toastState ? (
						<Animated.View
							pointerEvents="none"
							style={[
								toastStyles.toast,
								toastState.tone === 'success'
									? toastStyles.toastSuccess
									: toastStyles.toastWarning,
								{
									opacity: toastOpacity,
									transform: [{ translateY: toastTranslateY }],
								},
							]}
						>
							<View style={toastStyles.toast__iconWrap}>
								{toastState.tone === 'success' ? (
									<BoltIcon color={palette.accentStrong} size={18} />
								) : (
									<ReviewIcon color="#f4a261" size={18} />
								)}
							</View>
							<View style={toastStyles.toast__copy}>
								<Text style={toastStyles.toast__title}>{toastState.title}</Text>
								<Text style={toastStyles.toast__body}>{toastState.body}</Text>
							</View>
						</Animated.View>
					) : null}
				</View>
			</View>

			<BottomSheetPanel
				onClose={() => setIsFiltersOpen(false)}
				visible={isFiltersOpen}
			>
				<View style={sheetStyles.sheet__head}>
					<View style={sheetStyles.sheet__titleIcon}>
						<FilterIcon color={palette.accentStrong} size={18} />
					</View>
					<View style={sheetStyles.sheet__titleCopy}>
						<Text style={sheetStyles.sheet__title}>Фильтры сессии</Text>
						<Text style={sheetStyles.sheet__subtitle}>
							Настройте колоду, не перегружая главный экран и не отнимая высоту
							у карточки.
						</Text>
					</View>
				</View>

				<View style={sheetStyles.sheet__section}>
					<Text style={sheetStyles.sheet__sectionTitle}>Режим колоды</Text>
					<FilterRail
						onSelect={(value) => setDeckMode(value as DeckMode)}
						optionKeys={deckModeOptions.map((option) => option.key)}
						options={deckModeOptions.map((option) => option.label)}
						selectedValue={deckMode}
					/>
				</View>

				<View style={sheetStyles.sheet__section}>
					<Text style={sheetStyles.sheet__sectionTitle}>Тема</Text>
					<FilterRail
						onSelect={setSelectedCategory}
						options={categories}
						selectedValue={selectedCategory}
					/>
				</View>

				<View style={sheetStyles.sheet__section}>
					<Text style={sheetStyles.sheet__sectionTitle}>Сложность</Text>
					<FilterRail
						onSelect={(value) =>
							setSelectedDifficulty(
								value as (typeof difficultyOptions)[number]['key'],
							)
						}
						optionKeys={difficultyOptions.map((option) => option.key)}
						options={difficultyOptions.map((option) => option.label)}
						selectedValue={selectedDifficulty}
					/>
				</View>

				<View style={sheetStyles.sheet__actions}>
					<Pressable
						onPress={clearFilters}
						style={sheetStyles.sheet__ghostButton}
					>
						<Text style={sheetStyles.sheet__ghostButtonText}>Сбросить</Text>
					</Pressable>
					<Pressable
						onPress={() => setIsFiltersOpen(false)}
						style={sheetStyles.sheet__primaryButton}
					>
						<Text style={sheetStyles.sheet__primaryButtonText}>Готово</Text>
					</Pressable>
				</View>
			</BottomSheetPanel>

			<BottomSheetPanel
				keyboardAware
				onClose={closeAnswerSheet}
				visible={isAnswerSheetOpen}
			>
				<View style={sheetStyles.sheet__head}>
					<View style={sheetStyles.sheet__titleIcon}>
						<KeyboardIcon color={palette.accentStrong} size={18} />
					</View>
					<View style={sheetStyles.sheet__titleCopy}>
						<Text style={sheetStyles.sheet__title}>Проверьте себя руками</Text>
						<Text style={sheetStyles.sheet__subtitle}>
							Умная проверка понимает пробелы, разные кавычки, `sudo` и
							несколько допустимых вариантов.
						</Text>
					</View>
				</View>

				<View style={sheetStyles.prompt__card}>
					<Text style={sheetStyles.prompt__label}>Вопрос</Text>
					<Text style={sheetStyles.prompt__text}>{currentCard.question}</Text>
				</View>

				<View style={sheetStyles.input__block}>
					<Text style={sheetStyles.input__label}>Команда</Text>
					<TextInput
						autoCapitalize="none"
						autoCorrect={false}
						onChangeText={(value) => {
							setManualAnswer(value);
							if (manualFeedback) {
								setManualFeedback(null);
							}
						}}
						placeholder="Введите команду"
						placeholderTextColor={palette.textMuted}
						style={sheetStyles.input__field}
						value={manualAnswer}
					/>
				</View>

				{manualFeedback ? (
					<View
						style={[
							sheetStyles.feedback,
							manualFeedback.tone === 'success'
								? sheetStyles.feedbackSuccess
								: sheetStyles.feedbackWarning,
						]}
					>
						<View style={sheetStyles.feedback__head}>
							{manualFeedback.tone === 'success' ? (
								<CheckIcon color={palette.accentStrong} size={18} />
							) : (
								<ReviewIcon color="#f4a261" size={18} />
							)}
							<Text style={sheetStyles.feedback__title}>
								{manualFeedback.title}
							</Text>
						</View>
						<Text style={sheetStyles.feedback__body}>
							{manualFeedback.body}
						</Text>
					</View>
				) : null}

				<View style={sheetStyles.sheet__actions}>
					{manualFeedback?.tone === 'warning' ? (
						<Pressable
							onPress={sendManualToReview}
							style={sheetStyles.sheet__ghostButton}
						>
							<Text style={sheetStyles.sheet__ghostButtonText}>В повтор</Text>
						</Pressable>
					) : (
						<Pressable
							onPress={closeAnswerSheet}
							style={sheetStyles.sheet__ghostButton}
						>
							<Text style={sheetStyles.sheet__ghostButtonText}>Закрыть</Text>
						</Pressable>
					)}

					<Pressable
						onPress={() => void submitManualAnswer()}
						style={sheetStyles.sheet__primaryButton}
					>
						<Text style={sheetStyles.sheet__primaryButtonText}>
							{manualFeedback?.tone === 'warning'
								? 'Проверить снова'
								: 'Проверить'}
						</Text>
					</Pressable>
				</View>
			</BottomSheetPanel>

			<Modal
				animationType="slide"
				onRequestClose={() => setIsDetailsOpen(false)}
				presentationStyle="fullScreen"
				visible={isDetailsOpen}
			>
				<SafeAreaView style={detailsStyles.screen}>
					<View style={detailsStyles.screen__header}>
						<View style={detailsStyles.screen__headerCopy}>
							<Text style={detailsStyles.screen__eyebrow}>Подробнее по карточке</Text>
							<Text style={detailsStyles.screen__title}>{currentCard.question}</Text>
						</View>
						<Pressable
							onPress={() => setIsDetailsOpen(false)}
							style={detailsStyles.screen__closeButton}
						>
							<Text style={detailsStyles.screen__closeButtonText}>Закрыть</Text>
						</Pressable>
					</View>

					<ScrollView
						contentContainerStyle={detailsStyles.screen__content}
						showsVerticalScrollIndicator={false}
					>
						<View style={detailsStyles.card}>
							<View style={detailsStyles.card__metaRail}>
								<DetailMetaPill label={currentCard.category} />
								<DetailMetaPill label={getDifficultyLabel(currentCard.difficulty)} />
							</View>

							<DetailPanel
								body={currentCard.answer}
								title="Правильный ответ"
								tone="accent"
							/>
							<DetailPanel
								body={currentCard.example}
								title="Когда пригодится"
								tone="default"
							/>
							<DetailPanel
								body={currentCard.hint}
								title="Подсказка для запоминания"
								tone="subtle"
							/>

							{currentCard.acceptedAnswers?.length ? (
								<DetailPanel
									body={currentCard.acceptedAnswers.join('\n')}
									title="Допустимые варианты"
									tone="default"
								/>
							) : null}
						</View>
					</ScrollView>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	);
}

function FilterRail({
	onSelect,
	optionKeys,
	options,
	selectedValue,
}: {
	onSelect: (value: string) => void;
	optionKeys?: string[];
	options: string[];
	selectedValue: string;
}) {
	return (
		<ScrollView
			contentContainerStyle={sheetStyles.filterRail}
			horizontal
			showsHorizontalScrollIndicator={false}
		>
			{options.map((label, index) => {
				const value = optionKeys?.[index] ?? label;
				const isActive = value === selectedValue;

				return (
					<Pressable
						key={value}
						onPress={() => onSelect(value)}
						style={[
							sheetStyles.filterRail__chip,
							isActive && sheetStyles.filterRail__chipActive,
						]}
					>
						<Text
							style={[
								sheetStyles.filterRail__chipText,
								isActive && sheetStyles.filterRail__chipTextActive,
							]}
						>
							{label}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}

function CompletionChip({
	icon,
	label,
	tone,
	value,
}: {
	icon: ReactNode;
	label: string;
	tone: 'success' | 'warning';
	value: number;
}) {
	return (
		<View
			style={[
				emptyStyles.chip,
				tone === 'success' ? emptyStyles.chipSuccess : emptyStyles.chipWarning,
			]}
		>
			<View style={emptyStyles.chip__icon}>{icon}</View>
			<Text style={emptyStyles.chip__value}>{value}</Text>
			<Text style={emptyStyles.chip__label}>{label}</Text>
		</View>
	);
}

function DetailMetaPill({ label }: { label: string }) {
	return (
		<View style={detailsStyles.metaPill}>
			<Text numberOfLines={1} style={detailsStyles.metaPill__text}>
				{label}
			</Text>
		</View>
	);
}

function DetailPanel({
	body,
	title,
	tone,
}: {
	body: string;
	title: string;
	tone: 'accent' | 'default' | 'subtle';
}) {
	return (
		<View
			style={[
				detailsStyles.panel,
				tone === 'accent' && detailsStyles.panelAccent,
				tone === 'subtle' && detailsStyles.panelSubtle,
			]}
		>
			<Text style={detailsStyles.panel__title}>{title}</Text>
			<Text
				style={tone === 'accent' ? detailsStyles.panel__answer : detailsStyles.panel__body}
			>
				{body}
			</Text>
		</View>
	);
}

function getDifficultyLabel(value: Card['difficulty']) {
	switch (value) {
		case 'easy':
			return 'Легко';
		case 'medium':
			return 'Средне';
		case 'hard':
			return 'Сложно';
		default:
			return value;
	}
}

const screenStyles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: palette.background,
		overflow: 'hidden',
	},
	screen__content: {
		flex: 1,
		alignItems: 'center',
	},
	screen__frame: {
		flex: 1,
		alignSelf: 'center',
		position: 'relative',
		paddingTop: 8,
		gap: 10,
	},
	screen__frameCompact: {
		paddingTop: 6,
		gap: 8,
	},
});

const detailsStyles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: palette.background,
	},
	screen__header: {
		paddingHorizontal: 20,
		paddingTop: 12,
		paddingBottom: 14,
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: 12,
		borderBottomWidth: 1,
		borderBottomColor: palette.border,
		backgroundColor: 'rgba(8, 10, 13, 0.94)',
	},
	screen__headerCopy: {
		flex: 1,
		gap: 6,
	},
	screen__eyebrow: {
		color: palette.accentStrong,
		fontSize: 11,
		fontWeight: '800',
		letterSpacing: 1.2,
		textTransform: 'uppercase',
	},
	screen__title: {
		color: palette.textPrimary,
		fontSize: 20,
		fontWeight: '900',
		lineHeight: 27,
	},
	screen__closeButton: {
		paddingHorizontal: 15,
		paddingVertical: 11,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: palette.border,
		backgroundColor: palette.panelElevated,
	},
	screen__closeButtonText: {
		color: palette.textPrimary,
		fontSize: 13,
		fontWeight: '800',
	},
	screen__content: {
		paddingHorizontal: 16,
		paddingTop: 18,
		paddingBottom: 36,
		alignItems: 'center',
	},
	card: {
		width: '100%',
		maxWidth: 760,
		padding: 20,
		borderRadius: 30,
		borderWidth: 1,
		borderColor: palette.border,
		backgroundColor: palette.panel,
		gap: 14,
	},
	card__metaRail: {
		flexDirection: 'row',
		gap: 10,
	},
	metaPill: {
		flex: 1,
		minWidth: 0,
		paddingHorizontal: 13,
		paddingVertical: 10,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: palette.border,
		backgroundColor: palette.overlayPill,
		alignItems: 'center',
	},
	metaPill__text: {
		color: palette.textSecondary,
		fontSize: 11,
		fontWeight: '700',
	},
	panel: {
		padding: 18,
		borderRadius: 24,
		borderWidth: 1,
		borderColor: 'rgba(120, 130, 146, 0.12)',
		backgroundColor: palette.footerPanel,
		gap: 10,
	},
	panelAccent: {
		backgroundColor: palette.answerPanel,
	},
	panelSubtle: {
		backgroundColor: palette.subtlePanel,
	},
	panel__title: {
		color: palette.textMuted,
		fontSize: 11,
		fontWeight: '800',
		letterSpacing: 1.2,
		textTransform: 'uppercase',
	},
	panel__answer: {
		color: palette.textPrimary,
		fontSize: 24,
		fontWeight: '900',
		lineHeight: 31,
	},
	panel__body: {
		color: palette.textSecondary,
		fontSize: 15,
		lineHeight: 23,
	},
});

const loaderStyles = StyleSheet.create({
	loader: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
	},
	loader__text: {
		color: palette.textSecondary,
		fontSize: 16,
	},
});

const emptyStyles = StyleSheet.create({
	empty: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 24,
		gap: 16,
	},
	empty__eyebrow: {
		color: palette.accentStrong,
		fontSize: 12,
		fontWeight: '800',
		letterSpacing: 1.4,
		textTransform: 'uppercase',
	},
	empty__title: {
		color: palette.textPrimary,
		fontSize: 30,
		fontWeight: '900',
		lineHeight: 36,
	},
	empty__body: {
		color: palette.textSecondary,
		fontSize: 16,
		lineHeight: 24,
	},
	empty__statsRow: {
		flexDirection: 'row',
		gap: 12,
	},
	chip: {
		flex: 1,
		paddingHorizontal: 12,
		paddingVertical: 14,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: palette.border,
		gap: 4,
		alignItems: 'center',
	},
	chipSuccess: {
		backgroundColor: palette.successPanel,
	},
	chipWarning: {
		backgroundColor: palette.warningPanel,
	},
	chip__icon: {
		width: 32,
		height: 32,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.04)',
	},
	chip__value: {
		color: palette.textPrimary,
		fontSize: 18,
		fontWeight: '900',
	},
	chip__label: {
		color: palette.textMuted,
		fontSize: 11,
		fontWeight: '700',
	},
	empty__primaryAction: {
		backgroundColor: palette.accentStrong,
		borderRadius: 20,
		paddingVertical: 16,
		alignItems: 'center',
	},
	empty__primaryActionText: {
		color: palette.background,
		fontSize: 16,
		fontWeight: '900',
	},
	empty__secondaryAction: {
		backgroundColor: palette.overlayPill,
		borderRadius: 20,
		paddingVertical: 16,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: palette.border,
	},
	empty__secondaryActionText: {
		color: palette.textPrimary,
		fontSize: 15,
		fontWeight: '800',
	},
});

const toastStyles = StyleSheet.create({
	toast: {
		position: 'absolute',
		left: 16,
		right: 16,
		bottom: 142,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		borderRadius: 22,
		paddingHorizontal: 16,
		paddingVertical: 13,
		borderWidth: 1,
		zIndex: 30,
		elevation: 20,
	},
	toastSuccess: {
		backgroundColor: 'rgba(7, 18, 21, 0.94)',
		borderColor: 'rgba(130, 245, 208, 0.22)',
	},
	toastWarning: {
		backgroundColor: 'rgba(32, 19, 14, 0.94)',
		borderColor: 'rgba(244, 162, 97, 0.22)',
	},
	toast__iconWrap: {
		width: 34,
		height: 34,
		borderRadius: 12,
		backgroundColor: 'rgba(255, 255, 255, 0.03)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	toast__copy: {
		flex: 1,
		gap: 2,
	},
	toast__title: {
		color: palette.textPrimary,
		fontSize: 14,
		fontWeight: '800',
	},
	toast__body: {
		color: palette.textSecondary,
		fontSize: 12,
		lineHeight: 18,
	},
});

const sheetStyles = StyleSheet.create({
	sheet__head: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 12,
	},
	sheet__titleIcon: {
		width: 38,
		height: 38,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(130, 245, 208, 0.08)',
	},
	sheet__titleCopy: {
		flex: 1,
		gap: 6,
	},
	sheet__title: {
		color: palette.textPrimary,
		fontSize: 24,
		fontWeight: '900',
	},
	sheet__subtitle: {
		color: palette.textSecondary,
		fontSize: 14,
		lineHeight: 21,
	},
	sheet__section: {
		gap: 8,
	},
	sheet__sectionTitle: {
		color: palette.textPrimary,
		fontSize: 12,
		fontWeight: '800',
	},
	filterRail: {
		gap: 8,
		paddingRight: 10,
	},
	filterRail__chip: {
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: palette.border,
		backgroundColor: palette.overlayPill,
	},
	filterRail__chipActive: {
		borderColor: palette.accentStrong,
		backgroundColor: palette.accentStrong,
	},
	filterRail__chipText: {
		color: palette.textSecondary,
		fontSize: 11,
		fontWeight: '700',
	},
	filterRail__chipTextActive: {
		color: palette.background,
	},
	prompt__card: {
		padding: 16,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: palette.border,
		backgroundColor: palette.footerPanel,
		gap: 8,
	},
	prompt__label: {
		color: palette.textMuted,
		fontSize: 11,
		fontWeight: '800',
		letterSpacing: 1.1,
		textTransform: 'uppercase',
	},
	prompt__text: {
		color: palette.textPrimary,
		fontSize: 19,
		fontWeight: '800',
		lineHeight: 25,
	},
	input__block: {
		gap: 8,
	},
	input__label: {
		color: palette.textPrimary,
		fontSize: 12,
		fontWeight: '800',
	},
	input__field: {
		borderRadius: 18,
		borderWidth: 1,
		borderColor: palette.border,
		backgroundColor: palette.footerPanel,
		color: palette.textPrimary,
		fontSize: 16,
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	feedback: {
		padding: 14,
		borderRadius: 18,
		gap: 8,
	},
	feedbackSuccess: {
		backgroundColor: palette.successPanel,
	},
	feedbackWarning: {
		backgroundColor: palette.warningPanel,
	},
	feedback__head: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	feedback__title: {
		color: palette.textPrimary,
		fontSize: 15,
		fontWeight: '800',
	},
	feedback__body: {
		color: palette.textSecondary,
		fontSize: 13,
		lineHeight: 20,
	},
	sheet__actions: {
		flexDirection: 'row',
		gap: 12,
	},
	sheet__ghostButton: {
		flex: 1,
		borderRadius: 18,
		paddingVertical: 15,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: palette.border,
		backgroundColor: palette.overlayPill,
	},
	sheet__ghostButtonText: {
		color: palette.textPrimary,
		fontSize: 15,
		fontWeight: '800',
	},
	sheet__primaryButton: {
		flex: 1.2,
		borderRadius: 18,
		paddingVertical: 15,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: palette.accentStrong,
	},
	sheet__primaryButtonText: {
		color: palette.background,
		fontSize: 15,
		fontWeight: '900',
	},
});

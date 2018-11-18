// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

function expressionAllowed(stream, state, backUp) {
  return /^(?:operator|sof|keyword c|case|new|export|default|[\[{}\(,;:]|=>)$/.test(state.lastType) ||
    (state.lastType == "quasi" && /\{\s*$/.test(stream.string.slice(0, stream.pos - (backUp || 0))))
}

CodeMirror.defineMode("sc", function(config, parserConfig) {
  var indentUnit = config.indentUnit;
  var statementIndent = parserConfig.statementIndent;
  var jsonldMode = parserConfig.jsonld;
  var jsonMode = parserConfig.json || jsonldMode;
  var isTS = parserConfig.typescript;
  var wordRE = parserConfig.wordCharacters || /[\w$\xa1-\uffff]/;

  // Tokenizer

  var keywords = function(){
    function kw(type) {return {type: type, style: "keyword"};}
    var A = kw("keyword a"), B = kw("keyword b"), C = kw("keyword c");
    var operator = kw("operator"), atom = {type: "atom", style: "atom"};

    var jsKeywords = {
      "if": kw("if"), "while": A, "with": A, "else": B, "do": B, "try": B, "finally": B,
      "return": C, "break": C, "continue": C, "new": kw("new"), "delete": C, "throw": C, "debugger": C,
      "var": kw("var"), "const": kw("var"), "let": kw("var"),
      "function": kw("function"), "catch": kw("catch"),
      "for": kw("for"), "switch": kw("switch"), "case": kw("case"), "default": kw("default"),
      "in": operator, "typeof": operator, "instanceof": operator,
      "true": atom, "false": atom, "null": atom, "undefined": atom, "NaN": atom, "Infinity": atom,
      "this": kw("this"), "class": kw("class"), "super": kw("atom"),
      "yield": C, "export": kw("export"), "import": kw("import"), "extends": C,
      "await": C, "testingcolor": atom, "check": kw("keyword"),

      "UGenThunk" : kw("keyword"),
      "Crest" : kw("keyword"),
      "ProxyNodeMap" : kw("keyword"),
      "DragSource" : kw("keyword"),
      "FoaAsymmetry" : kw("keyword"),
      "PV_MagFreeze" : kw("keyword"),
      "Pprob" : kw("keyword"),
      "LFBrownNoise2" : kw("keyword"),
      "QTextView" : kw("keyword"),
      "StkShakers" : kw("keyword"),
      "QDragSink" : kw("keyword"),
      "ComplexRes" : kw("keyword"),
      "Tuning" : kw("keyword"),
      "PV_MagAbove" : kw("keyword"),
      "Post" : kw("keyword"),
      "XOut" : kw("keyword"),
      "ContiguousBlockAllocator" : kw("keyword"),
      "Pseries" : kw("keyword"),
      "Message" : kw("keyword"),
      "TIRand" : kw("keyword"),
      "AtsPartial" : kw("keyword"),
      "VOsc3" : kw("keyword"),
      "Psym1" : kw("keyword"),
      "KeyTrack" : kw("keyword"),
      "EnvirGui" : kw("keyword"),
      "QFont" : kw("keyword"),
      "GrainSin" : kw("keyword"),
      "SerialPort" : kw("keyword"),
      "GrainBuf" : kw("keyword"),
      "ListView" : kw("keyword"),
      "OnePole" : kw("keyword"),
      "NumControlBuses" : kw("keyword"),
      "HelpBrowser" : kw("keyword"),
      "AbstractPlayControl" : kw("keyword"),
      "ScopeOut2" : kw("keyword"),
      "PanX" : kw("keyword"),
      "PVInfo" : kw("keyword"),
      "SequenceableCollection" : kw("keyword"),
      "SinOsc" : kw("keyword"),
      "Plet" : kw("keyword"),
      "LatoocarfianC" : kw("keyword"),
      "FunctionList" : kw("keyword"),
      "HPZ2" : kw("keyword"),
      "CuspN" : kw("keyword"),
      "BBandPass" : kw("keyword"),
      "QAbstractStepValue" : kw("keyword"),
      "Select" : kw("keyword"),
      "Scope2" : kw("keyword"),
      "Unpack1FFT" : kw("keyword"),
      "SpectralEntropy" : kw("keyword"),
      "QEnvelopeView" : kw("keyword"),
      "Schmidt" : kw("keyword"),
      "VMScan2D" : kw("keyword"),
      "Dgeom" : kw("keyword"),
      "FMGrainBBF" : kw("keyword"),
      "StandardL" : kw("keyword"),
      "NL2" : kw("keyword"),
      "PlazyEnvirN" : kw("keyword"),
      "Plotter" : kw("keyword"),
      "RefCopy" : kw("keyword"),
      "ServerMeter" : kw("keyword"),
      "ArrayedCollection" : kw("keyword"),
      "Case" : kw("keyword"),
      "QUserView" : kw("keyword"),
      "Dswitch1" : kw("keyword"),
      "FoaEncoderMatrix" : kw("keyword"),
      "QCheckBox" : kw("keyword"),
      "NumOutputBuses" : kw("keyword"),
      "UHJtoB" : kw("keyword"),
      "QImage" : kw("keyword"),
      "Slope" : kw("keyword"),
      "IIRFilter" : kw("keyword"),
      "FilterPattern" : kw("keyword"),
      "Size" : kw("keyword"),
      "FoaMirror" : kw("keyword"),
      "PV_RecordBuf" : kw("keyword"),
      "HistoryGui" : kw("keyword"),
      "QItemViewBase" : kw("keyword"),
      "Ppar" : kw("keyword"),
      "PV_NoiseSynthF" : kw("keyword"),
      "FFTSpread" : kw("keyword"),
      "TPV" : kw("keyword"),
      "Qitch" : kw("keyword"),
      "Dust" : kw("keyword"),
      "Gendy5" : kw("keyword"),
      "Pitch" : kw("keyword"),
      "Pdef" : kw("keyword"),
      "Out" : kw("keyword"),
      "QMetaObject" : kw("keyword"),
      "TGrains3" : kw("keyword"),
      "BufCombL" : kw("keyword"),
      "QScrollTopView" : kw("keyword"),
      "QStackLayout" : kw("keyword"),
      "HID" : kw("keyword"),
      "PV_Diffuser" : kw("keyword"),
      "PV_RandWipe" : kw("keyword"),
      "Semaphore" : kw("keyword"),
      "QWebFontFamily" : kw("keyword"),
      "Gammatone" : kw("keyword"),
      "Plambda" : kw("keyword"),
      "Pdefn" : kw("keyword"),
      "LinkedList" : kw("keyword"),
      "LFDNoise1" : kw("keyword"),
      "SinGrainB" : kw("keyword"),
      "Clockmus" : kw("keyword"),
      "SinGrainBF" : kw("keyword"),
      "MIDIFuncSrcSysMessageMatcherND" : kw("keyword"),
      "Pause" : kw("keyword"),
      "NotificationRegistration" : kw("keyword"),
      "Play" : kw("keyword"),
      "OnError" : kw("keyword"),
      "Dxrand" : kw("keyword"),
      "TBall" : kw("keyword"),
      "StaticText" : kw("keyword"),
      "Dreset" : kw("keyword"),
      "LPCSynth" : kw("keyword"),
      "Lag2" : kw("keyword"),
      "SelectX" : kw("keyword"),
      "FoaProximity" : kw("keyword"),
      "EmbedOnce" : kw("keyword"),
      "PingPong" : kw("keyword"),
      "StkGlobals" : kw("keyword"),
      "Latoocarfian2DC" : kw("keyword"),
      "SampleDur" : kw("keyword"),
      "FoaTilt" : kw("keyword"),
      "Pcauchy" : kw("keyword"),
      "RBJLowShelf" : kw("keyword"),
      "RawPointer" : kw("keyword"),
      "FoaXform" : kw("keyword"),
      "DWGPluckedStiff" : kw("keyword"),
      "FSinOsc" : kw("keyword"),
      "Pfx" : kw("keyword"),
      "DebugFrame" : kw("keyword"),
      "SCScope" : kw("keyword"),
      "Git" : kw("keyword"),
      "Order" : kw("keyword"),
      "Poll" : kw("keyword"),
      "BBlockerBuf" : kw("keyword"),
      "Ptsym" : kw("keyword"),
      "ControlSpec" : kw("keyword"),
      "BAllPass" : kw("keyword"),
      "SCDoc" : kw("keyword"),
      "Ref" : kw("keyword"),
      "RandID" : kw("keyword"),
      "BasicNodeWatcher" : kw("keyword"),
      "TDuty_old" : kw("keyword"),
      "Ptime" : kw("keyword"),
      "PV_BrickWall" : kw("keyword"),
      "DetectSilence" : kw("keyword"),
      "PV_BinPlayBuf" : kw("keyword"),
      "Node" : kw("keyword"),
      "Crackle" : kw("keyword"),
      "ServerMeterView" : kw("keyword"),
      "Pprotect" : kw("keyword"),
      "ClipNoise" : kw("keyword"),
      "EZNumber" : kw("keyword"),
      "PV_MagScale" : kw("keyword"),
      "StkVoicForm" : kw("keyword"),
      "HairCell" : kw("keyword"),
      "Pgpar" : kw("keyword"),
      "FBSineL" : kw("keyword"),
      "Warp1" : kw("keyword"),
      "Image" : kw("keyword"),
      "False" : kw("keyword"),
      "TBrownRand" : kw("keyword"),
      "FoaPressZ" : kw("keyword"),
      "Streson" : kw("keyword"),
      "LRLPF" : kw("keyword"),
      "FoaPushY" : kw("keyword"),
      "HLayoutView" : kw("keyword"),
      "Pfhn" : kw("keyword"),
      "ObjectInspector" : kw("keyword"),
      "Paddp" : kw("keyword"),
      "PV_Cutoff" : kw("keyword"),
      "PV_PartialSynthF" : kw("keyword"),
      "SensoryDissonance" : kw("keyword"),
      "PstepNadd" : kw("keyword"),
      "DoubleArray" : kw("keyword"),
      "QScrollCanvas" : kw("keyword"),
      "Interpl" : kw("keyword"),
      "Integer" : kw("keyword"),
      "PlusFreqScope" : kw("keyword"),
      "IdentitySet" : kw("keyword"),
      "BLPF" : kw("keyword"),
      "Pwrap" : kw("keyword"),
      "Standard2DL" : kw("keyword"),
      "Prorate" : kw("keyword"),
      "FaderWarp" : kw("keyword"),
      "PdefnAllGui" : kw("keyword"),
      "MonoGrain" : kw("keyword"),
      "Environment" : kw("keyword"),
      "ScrollView" : kw("keyword"),
      "DrawGridX" : kw("keyword"),
      "UHJ2B" : kw("keyword"),
      "PV_LocalMax" : kw("keyword"),
      "MIDIFuncBothCAMessageMatcher" : kw("keyword"),
      "EZText" : kw("keyword"),
      "MeanTriggered" : kw("keyword"),
      "FitzHughNagumo" : kw("keyword"),
      "DrawGridY" : kw("keyword"),
      "FoaDominateZ" : kw("keyword"),
      "K2A" : kw("keyword"),
      "Method" : kw("keyword"),
      "Diwhite" : kw("keyword"),
      "DeprecatedError" : kw("keyword"),
      "Pgauss" : kw("keyword"),
      "Help" : kw("keyword"),
      "NearestN" : kw("keyword"),
      "BufInfoUGenBase" : kw("keyword"),
      "MIDIFuncChanMessageMatcher" : kw("keyword"),
      "BufDelayL" : kw("keyword"),
      "SortBuf" : kw("keyword"),
      "StkMandolin" : kw("keyword"),
      "FoaPushX" : kw("keyword"),
      "Integrator" : kw("keyword"),
      "BPeakEQ" : kw("keyword"),
      "Window" : kw("keyword"),
      "OSFold4" : kw("keyword"),
      "Atk" : kw("keyword"),
      "Unix" : kw("keyword"),
      "Vibrato" : kw("keyword"),
      "Index" : kw("keyword"),
      "OSCMessageDispatcher" : kw("keyword"),
      "ModDif" : kw("keyword"),
      "Feedback" : kw("keyword"),
      "ShouldNotImplementError" : kw("keyword"),
      "NLFiltL" : kw("keyword"),
      "CQ_Diff" : kw("keyword"),
      "PV_PhaseShift90" : kw("keyword"),
      "TChoose" : kw("keyword"),
      "LIDAbsSlot" : kw("keyword"),
      "LastValue" : kw("keyword"),
      "BusPlug" : kw("keyword"),
      "Pwhite" : kw("keyword"),
      "FrameInspector" : kw("keyword"),
      "QGridLayout" : kw("keyword"),
      "CombLP" : kw("keyword"),
      "Concat2" : kw("keyword"),
      "AtkKernelConv" : kw("keyword"),
      "SinGrainIBF" : kw("keyword"),
      "Pgeom" : kw("keyword"),
      "ScopeView" : kw("keyword"),
      "DPW4Saw" : kw("keyword"),
      "DemandEnvGen" : kw("keyword"),
      "PV_ExtractRepeat" : kw("keyword"),
      "AllpassL" : kw("keyword"),
      "OteyPiano" : kw("keyword"),
      "BLowPass" : kw("keyword"),
      "LatoocarfianN" : kw("keyword"),
      "PV_MagMinus" : kw("keyword"),
      "Pavaroh" : kw("keyword"),
      "Pfpar" : kw("keyword"),
      "CheckBadValues" : kw("keyword"),
      "EnvFollow" : kw("keyword"),
      "FlowViewLayout" : kw("keyword"),
      "ServerOptions" : kw("keyword"),
      "MultiOutUGen" : kw("keyword"),
      "ParGroup" : kw("keyword"),
      "Saw" : kw("keyword"),
      "Phaser" : kw("keyword"),
      "NAryOpStream" : kw("keyword"),
      "InGrain" : kw("keyword"),
      "Lag3" : kw("keyword"),
      "WrapIndex" : kw("keyword"),
      "SendTrig" : kw("keyword"),
      "Resonz" : kw("keyword"),
      "PageLayout" : kw("keyword"),
      "FFTTrigger" : kw("keyword"),
      "PV_MagNoise" : kw("keyword"),
      "EZRanger" : kw("keyword"),
      "VolumeGui" : kw("keyword"),
      "IndexInBetween" : kw("keyword"),
      "LPCAna" : kw("keyword"),
      "MembraneCircle" : kw("keyword"),
      "MaxLocalBufs" : kw("keyword"),
      "GrainIn" : kw("keyword"),
      "FhnTrig" : kw("keyword"),
      "RosslerResL" : kw("keyword"),
      "StringGui" : kw("keyword"),
      "HIDElement" : kw("keyword"),
      "EZSlider" : kw("keyword"),
      "XLine" : kw("keyword"),
      "FFTFluxPos" : kw("keyword"),
      "PV_HainsworthFoote" : kw("keyword"),
      "Control" : kw("keyword"),
      "BinaryOpXStream" : kw("keyword"),
      "LeakDC" : kw("keyword"),
      "Thunk" : kw("keyword"),
      "LFDNoise0" : kw("keyword"),
      "PV_MagGate" : kw("keyword"),
      "QSlider" : kw("keyword"),
      "MixedBundle" : kw("keyword"),
      "Pmulpre" : kw("keyword"),
      "GrainFMJ" : kw("keyword"),
      "Process" : kw("keyword"),
      "Dust2" : kw("keyword"),
      "TGrains2" : kw("keyword"),
      "Pmul" : kw("keyword"),
      "NotYetImplementedError" : kw("keyword"),
      "Gendy4" : kw("keyword"),
      "QDragBoth" : kw("keyword"),
      "ListPattern" : kw("keyword"),
      "APF" : kw("keyword"),
      "HIDFunc" : kw("keyword"),
      "Interval" : kw("keyword"),
      "TempoBusClock" : kw("keyword"),
      "Sweep" : kw("keyword"),
      "LinXFade2" : kw("keyword"),
      "DWGSoundBoard" : kw("keyword"),
      "QTextViewBase" : kw("keyword"),
      "FoaTransform" : kw("keyword"),
      "QAlignment" : kw("keyword"),
      "OSCBundle" : kw("keyword"),
      "NodeWatcher" : kw("keyword"),
      "PbindProxy" : kw("keyword"),
      "BhobLoShelf" : kw("keyword"),
      "FFTDiffMags" : kw("keyword"),
      "GbmanN" : kw("keyword"),
      "HIDCollection" : kw("keyword"),
      "LIDKeySlot" : kw("keyword"),
      "TaskProxy" : kw("keyword"),
      "Ppoisson" : kw("keyword"),
      "FoaDecoderKernel" : kw("keyword"),
      "PV_Mul" : kw("keyword"),
      "BMoog" : kw("keyword"),
      "OneZero" : kw("keyword"),
      "BFFreeVerb" : kw("keyword"),
      "OSFold8" : kw("keyword"),
      "CosineWarp" : kw("keyword"),
      "NestedAllpassL" : kw("keyword"),
      "BinaryOpFailureError" : kw("keyword"),
      "MIDIMessageDispatcherNV" : kw("keyword"),
      "TouchResponder" : kw("keyword"),
      "NdefMixer" : kw("keyword"),
      "LevelIndicator" : kw("keyword"),
      "BinaryOpFunction" : kw("keyword"),
      "QMultiSliderView" : kw("keyword"),
      "Prout" : kw("keyword"),
      "FMGrainB" : kw("keyword"),
      "XIn" : kw("keyword"),
      "Exception" : kw("keyword"),
      "PV_RandComb" : kw("keyword"),
      "RandSeed" : kw("keyword"),
      "Pair" : kw("keyword"),
      "Group" : kw("keyword"),
      "PfadeOut" : kw("keyword"),
      "Latoocarfian2DN" : kw("keyword"),
      "Lag2UD" : kw("keyword"),
      "FoaPush" : kw("keyword"),
      "Psetpre" : kw("keyword"),
      "QLimits" : kw("keyword"),
      "Pchain" : kw("keyword"),
      "Pselect" : kw("keyword"),
      "LFDClipNoise" : kw("keyword"),
      "EnvGate" : kw("keyword"),
      "Rest" : kw("keyword"),
      "Chromagram" : kw("keyword"),
      "ImmutableError" : kw("keyword"),
      "Collection" : kw("keyword"),
      "DiskOut" : kw("keyword"),
      "TrigAvg" : kw("keyword"),
      "Trig" : kw("keyword"),
      "PV_CopyPhase" : kw("keyword"),
      "PureMultiOutUGen" : kw("keyword"),
      "HIDElementProtoDispatcher" : kw("keyword"),
      "FFT" : kw("keyword"),
      "SCDocEntry" : kw("keyword"),
      "Limiter" : kw("keyword"),
      "MIDIFuncSrcMessageMatcherNV" : kw("keyword"),
      "MCLDChaosGen" : kw("keyword"),
      "LPZ1" : kw("keyword"),
      "NAryValueProxy" : kw("keyword"),
      "VBAP" : kw("keyword"),
      "SharedOut" : kw("keyword"),
      "PowerOfTwoBlock" : kw("keyword"),
      "A2K" : kw("keyword"),
      "LIDGui" : kw("keyword"),
      "ServerQuit" : kw("keyword"),
      "DetaBlockerBuf" : kw("keyword"),
      "StandardTrig" : kw("keyword"),
      "FoaFocus" : kw("keyword"),
      "DelTapRd" : kw("keyword"),
      "BeatStatistics" : kw("keyword"),
      "Meddis" : kw("keyword"),
      "QLineLayout" : kw("keyword"),
      "QRangeSlider" : kw("keyword"),
      "Delay2" : kw("keyword"),
      "Pbind" : kw("keyword"),
      "Dpoll" : kw("keyword"),
      "HIDUsageDispatcher" : kw("keyword"),
      "PV_Conj" : kw("keyword"),
      "QTopView" : kw("keyword"),
      "RunningSum" : kw("keyword"),
      "Pfindur" : kw("keyword"),
      "MedianTriggered" : kw("keyword"),
      "FFTSubbandFlux" : kw("keyword"),
      "LFNoise2" : kw("keyword"),
      "ProxyMonitorGui" : kw("keyword"),
      "PrettyEat" : kw("keyword"),
      "Tumble" : kw("keyword"),
      "BFGrainPanner" : kw("keyword"),
      "Frame" : kw("keyword"),
      "EnvironmentRedirect" : kw("keyword"),
      "NotificationCenter" : kw("keyword"),
      "SCViewHolder" : kw("keyword"),
      "Peventmod" : kw("keyword"),
      "PlinCong" : kw("keyword"),
      "Pquad" : kw("keyword"),
      "Fhn2DC" : kw("keyword"),
      "BBandStop" : kw("keyword"),
      "MatchingP" : kw("keyword"),
      "KmeansToBPSet1" : kw("keyword"),
      "BPZ2" : kw("keyword"),
      "OSCdef" : kw("keyword"),
      "Array2D" : kw("keyword"),
      "Maybe" : kw("keyword"),
      "MIDISysDataDropIndDispatcher" : kw("keyword"),
      "DragBoth" : kw("keyword"),
      "MedianSeparation" : kw("keyword"),
      "NumInputBuses" : kw("keyword"),
      "Module" : kw("keyword"),
      "Reflections" : kw("keyword"),
      "SkipNeedle" : kw("keyword"),
      "TwoZero" : kw("keyword"),
      "MIDISysDataDispatcher" : kw("keyword"),
      "MIDIOut" : kw("keyword"),
      "HDR" : kw("keyword"),
      "ToggleFF" : kw("keyword"),
      "Dbrown2" : kw("keyword"),
      "OscN" : kw("keyword"),
      "HighShelf" : kw("keyword"),
      "StkBlowHole" : kw("keyword"),
      "Squiz" : kw("keyword"),
      "Dbufwr" : kw("keyword"),
      "SVF" : kw("keyword"),
      "FFTComplexDev" : kw("keyword"),
      "LPFVS6" : kw("keyword"),
      "MIDIFuncBothMessageMatcher" : kw("keyword"),
      "PV_MagLog" : kw("keyword"),
      "TrigControl" : kw("keyword"),
      "List" : kw("keyword"),
      "EventStreamCleanup" : kw("keyword"),
      "SMS" : kw("keyword"),
      "PV_BinFilter" : kw("keyword"),
      "Place" : kw("keyword"),
      "FMGrainI" : kw("keyword"),
      "DoubleNestedAllpassN" : kw("keyword"),
      "FoaZoomZ" : kw("keyword"),
      "PV_MagShift" : kw("keyword"),
      "Pfin" : kw("keyword"),
      "StkSaxofony" : kw("keyword"),
      "LinSelectX" : kw("keyword"),
      "PV_RectComb" : kw("keyword"),
      "MIDIResponder" : kw("keyword"),
      "Lag" : kw("keyword"),
      "InfoUGenBase" : kw("keyword"),
      "QKeyModifiers" : kw("keyword"),
      "Shaper" : kw("keyword"),
      "SCDocNode" : kw("keyword"),
      "Stepper" : kw("keyword"),
      "BufMin" : kw("keyword"),
      "Point" : kw("keyword"),
      "SynthDefControl" : kw("keyword"),
      "Convolution2L" : kw("keyword"),
      "MethodOverride" : kw("keyword"),
      "Clipper8" : kw("keyword"),
      "BLowPass4" : kw("keyword"),
      "TTendency" : kw("keyword"),
      "OverlapTexture" : kw("keyword"),
      "Decimator" : kw("keyword"),
      "Gradient" : kw("keyword"),
      "FloatArray" : kw("keyword"),
      "MoogFF" : kw("keyword"),
      "Prewrite" : kw("keyword"),
      "ProcModR" : kw("keyword"),
      "QNumberBox" : kw("keyword"),
      "LFClipNoise" : kw("keyword"),
      "Pattern" : kw("keyword"),
      "DbFaderWarp" : kw("keyword"),
      "SOMRd" : kw("keyword"),
      "LPF1" : kw("keyword"),
      "SoftClipAmp8" : kw("keyword"),
      "EZListView" : kw("keyword"),
      "LinCongN" : kw("keyword"),
      "Layout" : kw("keyword"),
      "WiiCalibrationInfo" : kw("keyword"),
      "ScrollTopView" : kw("keyword"),
      "PV_MagClip" : kw("keyword"),
      "Duty" : kw("keyword"),
      "FuncFilterPattern" : kw("keyword"),
      "StreamControl" : kw("keyword"),
      "ControlName" : kw("keyword"),
      "BeatTrack" : kw("keyword"),
      "DelayN" : kw("keyword"),
      "TopView" : kw("keyword"),
      "FFTCrest" : kw("keyword"),
      "Scheduler" : kw("keyword"),
      "Harmonics" : kw("keyword"),
      "SCDocHTMLRenderer" : kw("keyword"),
      "BEQSuite" : kw("keyword"),
      "QTopScrollWidget" : kw("keyword"),
      "ScaleStream" : kw("keyword"),
      "WiiMoteGUI" : kw("keyword"),
      "CombC" : kw("keyword"),
      "DoesNotUnderstandError" : kw("keyword"),
      "Impulse" : kw("keyword"),
      "QStethoscope" : kw("keyword"),
      "Pdrop" : kw("keyword"),
      "AudioMSG" : kw("keyword"),
      "Logger" : kw("keyword"),
      "MIDIIn" : kw("keyword"),
      "FuncStream" : kw("keyword"),
      "AtkMatrixMix" : kw("keyword"),
      "AbstractStepValue" : kw("keyword"),
      "QTreeViewItem" : kw("keyword"),
      "Gbman2DC" : kw("keyword"),
      "OrderedIdentitySet" : kw("keyword"),
      "SOS" : kw("keyword"),
      "HIDFuncDeviceProtoMatcher" : kw("keyword"),
      "FoaFocusY" : kw("keyword"),
      "FlowView" : kw("keyword"),
      "Henon2DN" : kw("keyword"),
      "PlusFreqScopeView" : kw("keyword"),
      "Convolution" : kw("keyword"),
      "InGrainBF" : kw("keyword"),
      "EZPopUpMenu" : kw("keyword"),
      "RLPFD" : kw("keyword"),
      "SoftClipAmp" : kw("keyword"),
      "QAbstractScroll" : kw("keyword"),
      "FoaPanB" : kw("keyword"),
      "VDiskIn" : kw("keyword"),
      "NodeIDAllocator" : kw("keyword"),
      "JoshMultiChannelGrain" : kw("keyword"),
      "SmoothDecimator" : kw("keyword"),
      "SendPeakRMS" : kw("keyword"),
      "RMEQ" : kw("keyword"),
      "StkClarinet" : kw("keyword"),
      "SemiColonFileReader" : kw("keyword"),
      "SoundIn" : kw("keyword"),
      "OSCArgsMatcher" : kw("keyword"),
      "NumRunningSynths" : kw("keyword"),
      "QuarksGui" : kw("keyword"),
      "OSCFuncRecvPortMessageMatcher" : kw("keyword"),
      "PV_CommonMag" : kw("keyword"),
      "VBAPSpeakerArray" : kw("keyword"),
      "ScaleAD" : kw("keyword"),
      "NeedleRect" : kw("keyword"),
      "PV_Div" : kw("keyword"),
      "TuningInfo" : kw("keyword"),
      "PfinQuant" : kw("keyword"),
      "Pexprand" : kw("keyword"),
      "BufWr" : kw("keyword"),
      "PrimitiveFailedError" : kw("keyword"),
      "InGrainBBF" : kw("keyword"),
      "PV_SoftWipe" : kw("keyword"),
      "Dtag" : kw("keyword"),
      "VBAPSpeakerSet" : kw("keyword"),
      "Mix" : kw("keyword"),
      "Plorenz" : kw("keyword"),
      "Dseq" : kw("keyword"),
      "Fdef" : kw("keyword"),
      "WrapSummer" : kw("keyword"),
      "PrettyEcho" : kw("keyword"),
      "BLowShelf" : kw("keyword"),
      "HIDdef" : kw("keyword"),
      "Pspawner" : kw("keyword"),
      "Polar" : kw("keyword"),
      "FFTSlope" : kw("keyword"),
      "LFPulse" : kw("keyword"),
      "Clipper4" : kw("keyword"),
      "RecordBuf" : kw("keyword"),
      "Pxrand" : kw("keyword"),
      "FMHEncode1" : kw("keyword"),
      "Gendy3" : kw("keyword"),
      "Pbindef" : kw("keyword"),
      "SoftClipAmp4" : kw("keyword"),
      "Decorator" : kw("keyword"),
      "VBAPSpeaker" : kw("keyword"),
      "AverageOutput" : kw("keyword"),
      "Trig1" : kw("keyword"),
      "ControlRate" : kw("keyword"),
      "BFMonitor" : kw("keyword"),
      "PV_PitchShift" : kw("keyword"),
      "DebugNodeWatcher" : kw("keyword"),
      "TapN" : kw("keyword"),
      "BFMixer" : kw("keyword"),
      "TaskProxyGui" : kw("keyword"),
      "StringInspector" : kw("keyword"),
      "BlankGridLines" : kw("keyword"),
      "WAmp" : kw("keyword"),
      "BBlockerProgram" : kw("keyword"),
      "CCResponder" : kw("keyword"),
      "FoaDominate" : kw("keyword"),
      "Platoo" : kw("keyword"),
      "TdefAllGui" : kw("keyword"),
      "MIDISMPTEAssembler" : kw("keyword"),
      "ZPoint" : kw("keyword"),
      "QuadL" : kw("keyword"),
      "AtsParInfo" : kw("keyword"),
      "Gendy2" : kw("keyword"),
      "Plag" : kw("keyword"),
      "Padd" : kw("keyword"),
      "SpecFlatness" : kw("keyword"),
      "Pnaryop" : kw("keyword"),
      "FileDialog" : kw("keyword"),
      "HenonL" : kw("keyword"),
      "UnaryOpFunctionProxy" : kw("keyword"),
      "StkPluck" : kw("keyword"),
      "Dstutter" : kw("keyword"),
      "LinCongC" : kw("keyword"),
      "QLevelIndicatorStyle" : kw("keyword"),
      "FMHEncode0" : kw("keyword"),
      "CheapVerb" : kw("keyword"),
      "PackFFT" : kw("keyword"),
      "StackNumberAllocator" : kw("keyword"),
      "WaveletDaub" : kw("keyword"),
      "AttackSlope" : kw("keyword"),
      "KMeansRT" : kw("keyword"),
      "Library" : kw("keyword"),
      "RootNode" : kw("keyword"),
      "SimpleController" : kw("keyword"),
      "StkBeeThree" : kw("keyword"),
      "SFPlay" : kw("keyword"),
      "DelayWr" : kw("keyword"),
      "Pgroup" : kw("keyword"),
      "Button" : kw("keyword"),
      "PV_Add" : kw("keyword"),
      "Pgbrown" : kw("keyword"),
      "TGaussRand" : kw("keyword"),
      "FoaDirectO" : kw("keyword"),
      "TGrains" : kw("keyword"),
      "Dseries" : kw("keyword"),
      "TwoTube" : kw("keyword"),
      "DWGPlucked" : kw("keyword"),
      "PopUpMenu" : kw("keyword"),
      "SlotInspector" : kw("keyword"),
      "FFTPhaseDev" : kw("keyword"),
      "PV_Invert" : kw("keyword"),
      "TestDependant" : kw("keyword"),
      "Warp" : kw("keyword"),
      "DoubleNestedAllpassC" : kw("keyword"),
      "MultiTap" : kw("keyword"),
      "FoaUGen" : kw("keyword"),
      "Float" : kw("keyword"),
      "PV_ConformalMap" : kw("keyword"),
      "Pgbman" : kw("keyword"),
      "Wrap" : kw("keyword"),
      "StkModalBar" : kw("keyword"),
      "PV_BinDelay" : kw("keyword"),
      "Dwhite" : kw("keyword"),
      "Pnsym1" : kw("keyword"),
      "FoaFocusX" : kw("keyword"),
      "SimpleNumber" : kw("keyword"),
      "FoaDirectZ" : kw("keyword"),
      "FlowLayout" : kw("keyword"),
      "ChuaL" : kw("keyword"),
      "GrainFM" : kw("keyword"),
      "WaveLoss" : kw("keyword"),
      "SendReply" : kw("keyword"),
      "ServerTree" : kw("keyword"),
      "BufAllpassL" : kw("keyword"),
      "Balance2" : kw("keyword"),
      "Lorenz2DL" : kw("keyword"),
      "EZScroller" : kw("keyword"),
      "COsc" : kw("keyword"),
      "LIDRelSlot" : kw("keyword"),
      "Pseq" : kw("keyword"),
      "AY" : kw("keyword"),
      "DynKlang" : kw("keyword"),
      "NetAddr" : kw("keyword"),
      "PdefAllGui" : kw("keyword"),
      "OSTrunc8" : kw("keyword"),
      "Ptuple" : kw("keyword"),
      "LowShelf" : kw("keyword"),
      "Dgauss" : kw("keyword"),
      "DWGPlucked2" : kw("keyword"),
      "MIDIdef" : kw("keyword"),
      "XFade2" : kw("keyword"),
      "LPCAnalyzer" : kw("keyword"),
      "Pstandard" : kw("keyword"),
      "BF" : kw("keyword"),
      "Pretty" : kw("keyword"),
      "HIDDeviceDispatcher" : kw("keyword"),
      "TabletSlider2D" : kw("keyword"),
      "Fhn2DN" : kw("keyword"),
      "PanAz" : kw("keyword"),
      "Disintegrator" : kw("keyword"),
      "Int8Array" : kw("keyword"),
      "OnsetsDS" : kw("keyword"),
      "PlusFreqScopeWindow" : kw("keyword"),
      "SynthDesc" : kw("keyword"),
      "FileReader" : kw("keyword"),
      "QVLayoutView" : kw("keyword"),
      "Document" : kw("keyword"),
      "LIDInfo" : kw("keyword"),
      "VOsc" : kw("keyword"),
      "OSCFuncAddrMessageMatcher" : kw("keyword"),
      "QPalette" : kw("keyword"),
      "Pwhile" : kw("keyword"),
      "In" : kw("keyword"),
      "SystemSynthDefs" : kw("keyword"),
      "SinGrainI" : kw("keyword"),
      "OneShotStream" : kw("keyword"),
      "Pspawn" : kw("keyword"),
      "PrintVal" : kw("keyword"),
      "QListView" : kw("keyword"),
      "QuarkRowView" : kw("keyword"),
      "NodeMap" : kw("keyword"),
      "QtGUI" : kw("keyword"),
      "LRHPF" : kw("keyword"),
      "Int16Array" : kw("keyword"),
      "PV_MagMulAdd" : kw("keyword"),
      "Perlin3" : kw("keyword"),
      "ControlDur" : kw("keyword"),
      "ZPolar" : kw("keyword"),
      "Pn" : kw("keyword"),
      "LADSPA" : kw("keyword"),
      "BufGrainBF" : kw("keyword"),
      "PV_Copy" : kw("keyword"),
      "LFCub" : kw("keyword"),
      "BufDur" : kw("keyword"),
      "ProcSFPlayer" : kw("keyword"),
      "BRZ2" : kw("keyword"),
      "NodeProxy" : kw("keyword"),
      "FoaTumble" : kw("keyword"),
      "Object" : kw("keyword"),
      "WeaklyNonlinear2" : kw("keyword"),
      "InterplEnv" : kw("keyword"),
      "BHPF" : kw("keyword"),
      "TwoPole" : kw("keyword"),
      "SelectXFocus" : kw("keyword"),
      "LPCError" : kw("keyword"),
      "PparGroup" : kw("keyword"),
      "Stk" : kw("keyword"),
      "FreeVerb1" : kw("keyword"),
      "StkBowedI" : kw("keyword"),
      "FoaPsychoShelf" : kw("keyword"),
      "TdefGui" : kw("keyword"),
      "TextView" : kw("keyword"),
      "Font" : kw("keyword"),
      "DragSink" : kw("keyword"),
      "NumAudioBuses" : kw("keyword"),
      "Interpreter" : kw("keyword"),
      "Pindex" : kw("keyword"),
      "InterplPairs" : kw("keyword"),
      "Class" : kw("keyword"),
      "LimitedWriteStream" : kw("keyword"),
      "LTI" : kw("keyword"),
      "NodeProxyEditor" : kw("keyword"),
      "PmonoStream" : kw("keyword"),
      "QPenPrinter" : kw("keyword"),
      "BufMax" : kw("keyword"),
      "QColorRole" : kw("keyword"),
      "SharedIn" : kw("keyword"),
      "VOSIM" : kw("keyword"),
      "WalshHadamard" : kw("keyword"),
      "EZControlSpecEditor" : kw("keyword"),
      "InTrig" : kw("keyword"),
      "ProxySpace" : kw("keyword"),
      "Henon2DC" : kw("keyword"),
      "AtsBand" : kw("keyword"),
      "StreamClutch" : kw("keyword"),
      "Allpass1" : kw("keyword"),
      "AbstractDispatcher" : kw("keyword"),
      "DynKlank" : kw("keyword"),
      "MulAdd" : kw("keyword"),
      "MethodQuote" : kw("keyword"),
      "OSTrunc4" : kw("keyword"),
      "PatternProxy" : kw("keyword"),
      "Bag" : kw("keyword"),
      "Ndef" : kw("keyword"),
      "OSCpathDispatcher" : kw("keyword"),
      "LocalBuf" : kw("keyword"),
      "PanB2" : kw("keyword"),
      "PV_SpectralMap" : kw("keyword"),
      "Gbman2DN" : kw("keyword"),
      "Proutine" : kw("keyword"),
      "Pseed" : kw("keyword"),
      "MIDIFuncChanArrayMessageMatcher" : kw("keyword"),
      "TextField" : kw("keyword"),
      "InterplXYC" : kw("keyword"),
      "TRand" : kw("keyword"),
      "SparseArray" : kw("keyword"),
      "CombN" : kw("keyword"),
      "Phenon" : kw("keyword"),
      "Pgtpar" : kw("keyword"),
      "XInFeedback" : kw("keyword"),
      "Plprand" : kw("keyword"),
      "Switch1" : kw("keyword"),
      "JPverbRaw" : kw("keyword"),
      "AbstractWrappingDispatcher" : kw("keyword"),
      "BFEncode1" : kw("keyword"),
      "SynthDef" : kw("keyword"),
      "LID" : kw("keyword"),
      "TextVU" : kw("keyword"),
      "DegreeToKey" : kw("keyword"),
      "String" : kw("keyword"),
      "Dialog" : kw("keyword"),
      "Onsets" : kw("keyword"),
      "FlowVar" : kw("keyword"),
      "CheckBox" : kw("keyword"),
      "BufGrainIBF" : kw("keyword"),
      "UserView" : kw("keyword"),
      "DelayC" : kw("keyword"),
      "Timer" : kw("keyword"),
      "HenonC" : kw("keyword"),
      "Spkr" : kw("keyword"),
      "LinCongL" : kw("keyword"),
      "Vocoder" : kw("keyword"),
      "MatchingPResynth" : kw("keyword"),
      "AnalyseEvents2" : kw("keyword"),
      "PauseSelf" : kw("keyword"),
      "Peak" : kw("keyword"),
      "Speech" : kw("keyword"),
      "QuadC" : kw("keyword"),
      "Pipe" : kw("keyword"),
      "PV_XFade" : kw("keyword"),
      "PV_BinShift" : kw("keyword"),
      "ProxySynthDef" : kw("keyword"),
      "BRF" : kw("keyword"),
      "ScopeOut" : kw("keyword"),
      "InGrainB" : kw("keyword"),
      "Number" : kw("keyword"),
      "PriorityQueue" : kw("keyword"),
      "Pfxb" : kw("keyword"),
      "UnixPlatform" : kw("keyword"),
      "Done" : kw("keyword"),
      "MustBeBooleanError" : kw("keyword"),
      "PatternControl" : kw("keyword"),
      "Pbindf" : kw("keyword"),
      "Tap" : kw("keyword"),
      "AbstractResponderFunc" : kw("keyword"),
      "IdentityBag" : kw("keyword"),
      "FreeVerb2" : kw("keyword"),
      "CircleRamp" : kw("keyword"),
      "EventTypesWithCleanup" : kw("keyword"),
      "OnsetStatistics" : kw("keyword"),
      "Decay2" : kw("keyword"),
      "InFeedback" : kw("keyword"),
      "LocalOut" : kw("keyword"),
      "DecodeB2" : kw("keyword"),
      "IndexL" : kw("keyword"),
      "ScrollCanvas" : kw("keyword"),
      "OSCresponderNode" : kw("keyword"),
      "MIDIFuncSrcMessageMatcher" : kw("keyword"),
      "GraphBuilder" : kw("keyword"),
      "Normalizer" : kw("keyword"),
      "DoubleNestedAllpassL" : kw("keyword"),
      "FoaZoomX" : kw("keyword"),
      "PV_JensenAndersen" : kw("keyword"),
      "SortedList" : kw("keyword"),
      "PV_MinMagN" : kw("keyword"),
      "Drand" : kw("keyword"),
      "Convolution2" : kw("keyword"),
      "ProcEvents" : kw("keyword"),
      "ICepstrum" : kw("keyword"),
      "Greyhole" : kw("keyword"),
      "AmplitudeMod" : kw("keyword"),
      "Synth" : kw("keyword"),
      "True" : kw("keyword"),
      "LinkedListNode" : kw("keyword"),
      "PV_Min" : kw("keyword"),
      "SystemClock" : kw("keyword"),
      "LinuxPlatform" : kw("keyword"),
      "UnaryOpStream" : kw("keyword"),
      "PV_Freeze" : kw("keyword"),
      "AtsNoiSynth" : kw("keyword"),
      "Dshuf" : kw("keyword"),
      "BhobHiShelf" : kw("keyword"),
      "Allpass2" : kw("keyword"),
      "BufSampleRate" : kw("keyword"),
      "Hilbert" : kw("keyword"),
      "FreqScopeWindow" : kw("keyword"),
      "UniqueID" : kw("keyword"),
      "BFManipulate" : kw("keyword"),
      "ServerBoot" : kw("keyword"),
      "ScaleInfo" : kw("keyword"),
      "StkBowed" : kw("keyword"),
      "PV_MagExp" : kw("keyword"),
      "BufAllpassC" : kw("keyword"),
      "Inspector" : kw("keyword"),
      "Lorenz2DC" : kw("keyword"),
      "QTreeView" : kw("keyword"),
      "Magnitude" : kw("keyword"),
      "SineShaper" : kw("keyword"),
      "BFEncodeSter" : kw("keyword"),
      "PauseStream" : kw("keyword"),
      "StkBandedWG" : kw("keyword"),
      "Event" : kw("keyword"),
      "Watcher" : kw("keyword"),
      "WiiMoteIRObject" : kw("keyword"),
      "DoubleWell3" : kw("keyword"),
      "CompanderD" : kw("keyword"),
      "DUGen" : kw("keyword"),
      "AbstractNodeWatcher" : kw("keyword"),
      "DNoiseRing" : kw("keyword"),
      "PV_BinWipe" : kw("keyword"),
      "LFNoise0" : kw("keyword"),
      "BFEncode2" : kw("keyword"),
      "A2B" : kw("keyword"),
      "OSCresponder" : kw("keyword"),
      "OSCMessagePatternDispatcher" : kw("keyword"),
      "QQuartzComposerView" : kw("keyword"),
      "ViewRedirect" : kw("keyword"),
      "DrawGrid" : kw("keyword"),
      "WebView" : kw("keyword"),
      "Stream" : kw("keyword"),
      "PosRatio" : kw("keyword"),
      "InBus" : kw("keyword"),
      "Rotate" : kw("keyword"),
      "RHPF" : kw("keyword"),
      "SOMAreaWr" : kw("keyword"),
      "NAryOpFunctionProxy" : kw("keyword"),
      "AtsUGen" : kw("keyword"),
      "MIDIClient" : kw("keyword"),
      "ClearBuf" : kw("keyword"),
      "PlayBuf" : kw("keyword"),
      "BinaryOpFunctionProxy" : kw("keyword"),
      "SwitchDelay" : kw("keyword"),
      "OSCFuncBothMessageMatcher" : kw("keyword"),
      "FunctionDef" : kw("keyword"),
      "RadiansPerSample" : kw("keyword"),
      "Free" : kw("keyword"),
      "SCEnvelopeEdit" : kw("keyword"),
      "History" : kw("keyword"),
      "Psetp" : kw("keyword"),
      "NodeControl" : kw("keyword"),
      "BasicOpUGen" : kw("keyword"),
      "EnvelopeView" : kw("keyword"),
      "ListTrig" : kw("keyword"),
      "NRand" : kw("keyword"),
      "Gendy1" : kw("keyword"),
      "SubsampleOffset" : kw("keyword"),
      "JoshGrain" : kw("keyword"),
      "PV_CommonMul" : kw("keyword"),
      "SpecCentroid" : kw("keyword"),
      "FoaZoom" : kw("keyword"),
      "EnvDetect" : kw("keyword"),
      "DWGBowed" : kw("keyword"),
      "Platform" : kw("keyword"),
      "PMOsc" : kw("keyword"),
      "FreeSelf" : kw("keyword"),
      "FM7" : kw("keyword"),
      "BinaryOpPlug" : kw("keyword"),
      "Pan2" : kw("keyword"),
      "RunningMin" : kw("keyword"),
      "VLayoutView" : kw("keyword"),
      "TabletView" : kw("keyword"),
      "EnvGen" : kw("keyword"),
      "BinaryOpUGen" : kw("keyword"),
      "ItemViewBase" : kw("keyword"),
      "RawArray" : kw("keyword"),
      "PV_BufRd" : kw("keyword"),
      "MIDIEndPoint" : kw("keyword"),
      "PV_MagSmear" : kw("keyword"),
      "Dbrown" : kw("keyword"),
      "MIDIFunc" : kw("keyword"),
      "Pdict" : kw("keyword"),
      "FFTPower" : kw("keyword"),
      "Pseg" : kw("keyword"),
      "VarSaw" : kw("keyword"),
      "Pcollect" : kw("keyword"),
      "Quant" : kw("keyword"),
      "QColorGroup" : kw("keyword"),
      "Spreader" : kw("keyword"),
      "SpecPcile" : kw("keyword"),
      "ServerShmInterface" : kw("keyword"),
      "FoaDirectY" : kw("keyword"),
      "RosslerL" : kw("keyword"),
      "Notch" : kw("keyword"),
      "Henon2DL" : kw("keyword"),
      "PV_MagDiv" : kw("keyword"),
      "Pwrand" : kw("keyword"),
      "DWGBowedSimple" : kw("keyword"),
      "Pdiff" : kw("keyword"),
      "InRange" : kw("keyword"),
      "Int32Array" : kw("keyword"),
      "BufRateScale" : kw("keyword"),
      "Donce" : kw("keyword"),
      "Knob" : kw("keyword"),
      "FoaBalance" : kw("keyword"),
      "FreqScopeView" : kw("keyword"),
      "BlockSize" : kw("keyword"),
      "Pplayer" : kw("keyword"),
      "BufGrainI" : kw("keyword"),
      "Pser" : kw("keyword"),
      "BtoUHJ" : kw("keyword"),
      "Max" : kw("keyword"),
      "FoaRTT" : kw("keyword"),
      "BPF" : kw("keyword"),
      "FreeVerb" : kw("keyword"),
      "Pluck" : kw("keyword"),
      "MdaPiano" : kw("keyword"),
      "PV_Whiten" : kw("keyword"),
      "MFCC" : kw("keyword"),
      "InGrainIBF" : kw("keyword"),
      "QScope2" : kw("keyword"),
      "Env" : kw("keyword"),
      "DelayL" : kw("keyword"),
      "MIDIEvent" : kw("keyword"),
      "FFTCentroid" : kw("keyword"),
      "VocodeBand" : kw("keyword"),
      "SetResetFF" : kw("keyword"),
      "QWebView" : kw("keyword"),
      "SubclassResponsibilityError" : kw("keyword"),
      "EventPatternProxy" : kw("keyword"),
      "LFGauss" : kw("keyword"),
      "TermanWang" : kw("keyword"),
      "Pmono" : kw("keyword"),
      "BLBufRd" : kw("keyword"),
      "GlitchRHPF" : kw("keyword"),
      "FFTPeak" : kw("keyword"),
      "WiiMote" : kw("keyword"),
      "PathName" : kw("keyword"),
      "Latch" : kw("keyword"),
      "Pen" : kw("keyword"),
      "File" : kw("keyword"),
      "PeakEQ2" : kw("keyword"),
      "CrossoverDistortion" : kw("keyword"),
      "Slew" : kw("keyword"),
      "FormantTable" : kw("keyword"),
      "Paddpre" : kw("keyword"),
      "Sequencer" : kw("keyword"),
      "SoundFile" : kw("keyword"),
      "QScope" : kw("keyword"),
      "RecNodeProxy" : kw("keyword"),
      "LFPar" : kw("keyword"),
      "Fhn2DL" : kw("keyword"),
      "Finalizer" : kw("keyword"),
      "Quarks" : kw("keyword"),
      "GridLines" : kw("keyword"),
      "SynthDescLib" : kw("keyword"),
      "PSinGrain" : kw("keyword"),
      "ChaosGen" : kw("keyword"),
      "NoteOffResponder" : kw("keyword"),
      "EZKnob" : kw("keyword"),
      "AbstractScroll" : kw("keyword"),
      "Lag3UD" : kw("keyword"),
      "Symbol" : kw("keyword"),
      "WiiNunchukGUI" : kw("keyword"),
      "SOMTrain" : kw("keyword"),
      "OutputProxy" : kw("keyword"),
      "Lorenz2DN" : kw("keyword"),
      "Psym" : kw("keyword"),
      "BufGrain" : kw("keyword"),
      "BufAllpassN" : kw("keyword"),
      "LIDSlot" : kw("keyword"),
      "TwoWayIdentityDictionary" : kw("keyword"),
      "Player" : kw("keyword"),
      "LinLin" : kw("keyword"),
      "FoaDirectX" : kw("keyword"),
      "BFGVerb" : kw("keyword"),
      "ProcSink" : kw("keyword"),
      "QVLayout" : kw("keyword"),
      "JoshMultiOutGrain" : kw("keyword"),
      "GrainBufJ" : kw("keyword"),
      "PV_Compander" : kw("keyword"),
      "Foa" : kw("keyword"),
      "FoaFocusZ" : kw("keyword"),
      "Pshuf" : kw("keyword"),
      "Quark" : kw("keyword"),
      "Ramp" : kw("keyword"),
      "Pnsym" : kw("keyword"),
      "TopScrollWidget" : kw("keyword"),
      "Tartini" : kw("keyword"),
      "Stethoscope" : kw("keyword"),
      "ReplaceOut" : kw("keyword"),
      "MarkovSynth" : kw("keyword"),
      "RegaliaMitraEQ" : kw("keyword"),
      "Prand" : kw("keyword"),
      "ProgramChangeResponder" : kw("keyword"),
      "UnaryOpFunction" : kw("keyword"),
      "ZHPF" : kw("keyword"),
      "Main" : kw("keyword"),
      "QHLayout" : kw("keyword"),
      "QSoundFileView" : kw("keyword"),
      "TextViewBase" : kw("keyword"),
      "SynthDefOld" : kw("keyword"),
      "Tilt" : kw("keyword"),
      "Char" : kw("keyword"),
      "Array" : kw("keyword"),
      "Dunique" : kw("keyword"),
      "Score" : kw("keyword"),
      "Dswitch" : kw("keyword"),
      "Breakcore" : kw("keyword"),
      "LPF" : kw("keyword"),
      "WidthFirstUGen" : kw("keyword"),
      "Pmeanrand" : kw("keyword"),
      "T2K" : kw("keyword"),
      "Dser" : kw("keyword"),
      "LFSaw" : kw("keyword"),
      "QFileDialog" : kw("keyword"),
      "FMHEncode2" : kw("keyword"),
      "DriveNoise" : kw("keyword"),
      "Spring" : kw("keyword"),
      "BFDecode" : kw("keyword"),
      "LinPan2" : kw("keyword"),
      "Pwalk" : kw("keyword"),
      "RingBuffer" : kw("keyword"),
      "FoaNFC" : kw("keyword"),
      "View" : kw("keyword"),
      "BrownNoise" : kw("keyword"),
      "HenonN" : kw("keyword"),
      "Pdfsm" : kw("keyword"),
      "ExponentialWarp" : kw("keyword"),
      "FincoSprottS" : kw("keyword"),
      "MoogVCF" : kw("keyword"),
      "RunningMax" : kw("keyword"),
      "QuadN" : kw("keyword"),
      "PstepNfunc" : kw("keyword"),
      "Hasher" : kw("keyword"),
      "DelTapWr" : kw("keyword"),
      "TabFileReader" : kw("keyword"),
      "HilbertFIR" : kw("keyword"),
      "Pslide" : kw("keyword"),
      "SCVim" : kw("keyword"),
      "LatoocarfianTrig" : kw("keyword"),
      "Ptpar" : kw("keyword"),
      "DiskIn" : kw("keyword"),
      "StkMoog" : kw("keyword"),
      "Pclump" : kw("keyword"),
      "FoaDecode" : kw("keyword"),
      "Ball" : kw("keyword"),
      "FrameCompare" : kw("keyword"),
      "Gate" : kw("keyword"),
      "LFNoise1" : kw("keyword"),
      "GVerb" : kw("keyword"),
      "TextArchiveMDPlugin" : kw("keyword"),
      "KeyClarity" : kw("keyword"),
      "Rotate2" : kw("keyword"),
      "LPCFile" : kw("keyword"),
      "CombL" : kw("keyword"),
      "ObjectGui" : kw("keyword"),
      "AtsNoise" : kw("keyword"),
      "DoubleWell2" : kw("keyword"),
      "HIDProto" : kw("keyword"),
      "Pulse" : kw("keyword"),
      "PV_Max" : kw("keyword"),
      "HIDFuncElementProtoMatcher" : kw("keyword"),
      "RMEQSuite" : kw("keyword"),
      "BhobTone" : kw("keyword"),
      "Dictionary" : kw("keyword"),
      "FMGrainBF" : kw("keyword"),
      "Task" : kw("keyword"),
      "LorenzL" : kw("keyword"),
      "RBJNotch" : kw("keyword"),
      "Gbman2DL" : kw("keyword"),
      "FoaDirect" : kw("keyword"),
      "PmonoArtic" : kw("keyword"),
      "Rect" : kw("keyword"),
      "QSlider2D" : kw("keyword"),
      "Slider" : kw("keyword"),
      "PAbstractGroup" : kw("keyword"),
      "Pstep" : kw("keyword"),
      "Penv" : kw("keyword"),
      "CurveWarp" : kw("keyword"),
      "InterplChord" : kw("keyword"),
      "OteyPianoStrings" : kw("keyword"),
      "Condition" : kw("keyword"),
      "WarpZ" : kw("keyword"),
      "AbstractSystemAction" : kw("keyword"),
      "PdurStutter" : kw("keyword"),
      "Pconst" : kw("keyword"),
      "VLayout" : kw("keyword"),
      "TWindex" : kw("keyword"),
      "Range" : kw("keyword"),
      "BlitB3Tri" : kw("keyword"),
      "BHiPass" : kw("keyword"),
      "FMGrain" : kw("keyword"),
      "PV_DiffMags" : kw("keyword"),
      "MembraneHexagon" : kw("keyword"),
      "Pfuncn" : kw("keyword"),
      "CSVFileReader" : kw("keyword"),
      "BufGrainBBF" : kw("keyword"),
      "AbstractFunction" : kw("keyword"),
      "FoaZoomY" : kw("keyword"),
      "GbmanTrig" : kw("keyword"),
      "QPen" : kw("keyword"),
      "Association" : kw("keyword"),
      "QWindow" : kw("keyword"),
      "Convolution3" : kw("keyword"),
      "FreeSelfWhenDone" : kw("keyword"),
      "EZLists" : kw("keyword"),
      "Phrase" : kw("keyword"),
      "BinData" : kw("keyword"),
      "BusScopeSynth" : kw("keyword"),
      "HLayout" : kw("keyword"),
      "PlazyEnvir" : kw("keyword"),
      "NodeID" : kw("keyword"),
      "Sum3" : kw("keyword"),
      "RMAFoodChainL" : kw("keyword"),
      "OSCpathResponder" : kw("keyword"),
      "Ptrace" : kw("keyword"),
      "Pstutter" : kw("keyword"),
      "BeatTrack2" : kw("keyword"),
      "DragView" : kw("keyword"),
      "MethodInspector" : kw("keyword"),
      "FoaRotate" : kw("keyword"),
      "TDelay" : kw("keyword"),
      "GlitchHPF" : kw("keyword"),
      "OSCFunc" : kw("keyword"),
      "PointArray" : kw("keyword"),
      "FFTSubbandFlatness" : kw("keyword"),
      "DoubleWell" : kw("keyword"),
      "LocalIn" : kw("keyword"),
      "Download" : kw("keyword"),
      "MonitorGui" : kw("keyword"),
      "SymbolArray" : kw("keyword"),
      "PVSynth" : kw("keyword"),
      "PV_MagBuffer" : kw("keyword"),
      "HIDValueMatcher" : kw("keyword"),
      "LIDMscSlot" : kw("keyword"),
      "PV_MagSubtract" : kw("keyword"),
      "BinaryOpStream" : kw("keyword"),
      "Pget" : kw("keyword"),
      "HiliteGradient" : kw("keyword"),
      "RMShelf" : kw("keyword"),
      "LIDLedSlot" : kw("keyword"),
      "OffsetOut" : kw("keyword"),
      "HPF" : kw("keyword"),
      "BFDecoder" : kw("keyword"),
      "UnpackFFT" : kw("keyword"),
      "Maxamp" : kw("keyword"),
      "BundleNetAddr" : kw("keyword"),
      "Slider2D" : kw("keyword"),
      "OSWrap8" : kw("keyword"),
      "BHiShelf" : kw("keyword"),
      "PinkNoise" : kw("keyword"),
      "ParamView" : kw("keyword"),
      "ListDUGen" : kw("keyword"),
      "SplayAz" : kw("keyword"),
      "HIDElementProto" : kw("keyword"),
      "QLevelIndicator" : kw("keyword"),
      "FMHDecode1" : kw("keyword"),
      "MIDISysNoDataDispatcher" : kw("keyword"),
      "PV_PlayBuf" : kw("keyword"),
      "MultiSliderView" : kw("keyword"),
      "KeyMode" : kw("keyword"),
      "ScaleLP" : kw("keyword"),
      "NoteOnResponder" : kw("keyword"),
      "BufDelayC" : kw("keyword"),
      "AmpCompA" : kw("keyword"),
      "PVAna" : kw("keyword"),
      "PeakFollower" : kw("keyword"),
      "MouseX" : kw("keyword"),
      "FuncStreamAsRoutine" : kw("keyword"),
      "UnaryOpPlug" : kw("keyword"),
      "Fold" : kw("keyword"),
      "NLFiltC" : kw("keyword"),
      "RangeSlider" : kw("keyword"),
      "ZLPF" : kw("keyword"),
      "Formant" : kw("keyword"),
      "Pan4" : kw("keyword"),
      "ArrayMax" : kw("keyword"),
      "UnaryOpUGen" : kw("keyword"),
      "Tdef" : kw("keyword"),
      "FOS" : kw("keyword"),
      "Nil" : kw("keyword"),
      "GravityGrid2" : kw("keyword"),
      "DetectIndex" : kw("keyword"),
      "SineWarp" : kw("keyword"),
      "Klang" : kw("keyword"),
      "StandardN" : kw("keyword"),
      "OSCMultiResponder" : kw("keyword"),
      "Ppatmod" : kw("keyword"),
      "URI" : kw("keyword"),
      "PV_SpectralEnhance" : kw("keyword"),
      "GreyholeRaw" : kw("keyword"),
      "LorenzTrig" : kw("keyword"),
      "AppClock" : kw("keyword"),
      "Pgate" : kw("keyword"),
      "LibraryBase" : kw("keyword"),
      "CuspL" : kw("keyword"),
      "QuarkDetailView" : kw("keyword"),
      "PV_MagSquared" : kw("keyword"),
      "LoopBuf" : kw("keyword"),
      "QDragView" : kw("keyword"),
      "MonoGrainBF" : kw("keyword"),
      "FFTSubbandPower" : kw("keyword"),
      "Coyote" : kw("keyword"),
      "AllpassC" : kw("keyword"),
      "ClassInspector" : kw("keyword"),
      "SLOnset" : kw("keyword"),
      "QLayout" : kw("keyword"),
      "MultiOutDemandUGen" : kw("keyword"),
      "RMShelf2" : kw("keyword"),
      "Pmulp" : kw("keyword"),
      "AbstractMessageMatcher" : kw("keyword"),
      "AtsAmp" : kw("keyword"),
      "Buffer" : kw("keyword"),
      "ZeroCrossing" : kw("keyword"),
      "BufRd" : kw("keyword"),
      "Pset" : kw("keyword"),
      "Linen" : kw("keyword"),
      "TaskProxyAllGui" : kw("keyword"),
      "PanX2D" : kw("keyword"),
      "ContiguousBlock" : kw("keyword"),
      "NumBuffers" : kw("keyword"),
      "Pbeta" : kw("keyword"),
      "AbstractIn" : kw("keyword"),
      "FoaDecoderMatrix" : kw("keyword"),
      "Pswitch" : kw("keyword"),
      "LPZ2" : kw("keyword"),
      "Pstep3add" : kw("keyword"),
      "DPW3Tri" : kw("keyword"),
      "QDragSource" : kw("keyword"),
      "LazyEnvir" : kw("keyword"),
      "LeastChange" : kw("keyword"),
      "IdentityDictionary" : kw("keyword"),
      "TreeViewItem" : kw("keyword"),
      "RBJHighShelf" : kw("keyword"),
      "ShutDown" : kw("keyword"),
      "Clip" : kw("keyword"),
      "BlitB3Saw" : kw("keyword"),
      "Server" : kw("keyword"),
      "FreqScope" : kw("keyword"),
      "LFBrownNoise0" : kw("keyword"),
      "CmdPeriod" : kw("keyword"),
      "GrainSinJ" : kw("keyword"),
      "MantissaMask" : kw("keyword"),
      "StkInst" : kw("keyword"),
      "SplayZ" : kw("keyword"),
      "Balance" : kw("keyword"),
      "FMGrainIBF" : kw("keyword"),
      "Delay1" : kw("keyword"),
      "FoaDominateY" : kw("keyword"),
      "GrainInJ" : kw("keyword"),
      "B2A" : kw("keyword"),
      "Speakers" : kw("keyword"),
      "NL" : kw("keyword"),
      "Standard2DN" : kw("keyword"),
      "Goertzel" : kw("keyword"),
      "Routine" : kw("keyword"),
      "BHiPass4" : kw("keyword"),
      "QScrollView" : kw("keyword"),
      "FoaSpeakerMatrix" : kw("keyword"),
      "MouseButton" : kw("keyword"),
      "AudioIn" : kw("keyword"),
      "Pif" : kw("keyword"),
      "Preject" : kw("keyword"),
      "Sum4" : kw("keyword"),
      "QCurve" : kw("keyword"),
      "BufFrames" : kw("keyword"),
      "LagUD" : kw("keyword"),
      "OSWrap4" : kw("keyword"),
      "Brusselator" : kw("keyword"),
      "FoaPressX" : kw("keyword"),
      "UnixFILE" : kw("keyword"),
      "NestedAllpassC" : kw("keyword"),
      "UGen" : kw("keyword"),
      "FBSineN" : kw("keyword"),
      "Splay" : kw("keyword"),
      "RPlay" : kw("keyword"),
      "Formlet" : kw("keyword"),
      "Summer" : kw("keyword"),
      "CompositeView" : kw("keyword"),
      "AbstractGroup" : kw("keyword"),
      "RingNumberAllocator" : kw("keyword"),
      "EZGui" : kw("keyword"),
      "MostChange" : kw("keyword"),
      "Pbus" : kw("keyword"),
      "TExpRand" : kw("keyword"),
      "Logistic" : kw("keyword"),
      "ScopeBuffer" : kw("keyword"),
      "NumberBox" : kw("keyword"),
      "Dbufrd" : kw("keyword"),
      "FeatureSave" : kw("keyword"),
      "Instruction" : kw("keyword"),
      "Klank" : kw("keyword"),
      "SyncSaw" : kw("keyword"),
      "Pfinval" : kw("keyword"),
      "SetBuf" : kw("keyword"),
      "StartUp" : kw("keyword"),
      "Dwrand" : kw("keyword"),
      "Pswitch1" : kw("keyword"),
      "DFM1" : kw("keyword"),
      "Silent" : kw("keyword"),
      "LPCVals" : kw("keyword"),
      "AutoTrack" : kw("keyword"),
      "QView" : kw("keyword"),
      "PmonoArticStream" : kw("keyword"),
      "Dfsm" : kw("keyword"),
      "NamedControl" : kw("keyword"),
      "Boolean" : kw("keyword"),
      "Pbrown" : kw("keyword"),
      "MIDIValueMatcher" : kw("keyword"),
      "AbstractOut" : kw("keyword"),
      "Thread" : kw("keyword"),
      "MIDISysexDispatcher" : kw("keyword"),
      "TempoClock" : kw("keyword"),
      "QStaticText" : kw("keyword"),
      "WhiteNoise" : kw("keyword"),
      "ProxyMixer" : kw("keyword"),
      "IEnvGen" : kw("keyword"),
      "B2Ster" : kw("keyword"),
      "CollStream" : kw("keyword"),
      "LFTri" : kw("keyword"),
      "Pstretch" : kw("keyword"),
      "PrettyState" : kw("keyword"),
      "Pclutch" : kw("keyword"),
      "QKey" : kw("keyword"),
      "MidEQ" : kw("keyword"),
      "OutOfContextReturnError" : kw("keyword"),
      "PatternConductor" : kw("keyword"),
      "PV_EvenBin" : kw("keyword"),
      "Plot" : kw("keyword"),
      "Ringz" : kw("keyword"),
      "PV_FreqBuffer" : kw("keyword"),
      "Demand" : kw("keyword"),
      "FincoSprottM" : kw("keyword"),
      "Metro" : kw("keyword"),
      "EventStreamPlayer" : kw("keyword"),
      "Dibrown" : kw("keyword"),
      "LFDNoise3" : kw("keyword"),
      "Monitor" : kw("keyword"),
      "FreqShift" : kw("keyword"),
      "LRUNumberAllocator" : kw("keyword"),
      "Concat" : kw("keyword"),
      "Phprand" : kw("keyword"),
      "Rand" : kw("keyword"),
      "StkFlute" : kw("keyword"),
      "ScoreStreamPlayer" : kw("keyword"),
      "SCContainerView" : kw("keyword"),
      "Pevent" : kw("keyword"),
      "InsideOut" : kw("keyword"),
      "PauseSelfWhenDone" : kw("keyword"),
      "PlaneTree" : kw("keyword"),
      "BufCombN" : kw("keyword"),
      "Loudness" : kw("keyword"),
      "PulseDivider" : kw("keyword"),
      "Pproto" : kw("keyword"),
      "ListTrig2" : kw("keyword"),
      "Set" : kw("keyword"),
      "Dneuromodule" : kw("keyword"),
      "PdegreeToKey" : kw("keyword"),
      "PV_PartialSynthP" : kw("keyword"),
      "LagIn" : kw("keyword"),
      "DrumTrack" : kw("keyword"),
      "BFPanner" : kw("keyword"),
      "SinGrainBBF" : kw("keyword"),
      "BufSamples" : kw("keyword"),
      "PV_MagSmooth" : kw("keyword"),
      "RLPF" : kw("keyword"),
      "BFDecode1" : kw("keyword"),
      "PV_RectComb2" : kw("keyword"),
      "FincoSprottL" : kw("keyword"),
      "FoaEncode" : kw("keyword"),
      "CoinGate" : kw("keyword"),
      "QTextField" : kw("keyword"),
      "Volume" : kw("keyword"),
      "WarpOverlap" : kw("keyword"),
      "GlitchBPF" : kw("keyword"),
      "PV_ChainUGen" : kw("keyword"),
      "QDialog" : kw("keyword"),
      "WaveTerrain" : kw("keyword"),
      "PdefGui" : kw("keyword"),
      "ProcProcessor" : kw("keyword"),
      "DWGBowedTor" : kw("keyword"),
      "Decay" : kw("keyword"),
      "SkipJack" : kw("keyword"),
      "BufGrainB" : kw("keyword"),
      "SampleRate" : kw("keyword"),
      "B2UHJ" : kw("keyword"),
      "SoftClipper4" : kw("keyword"),
      "BlitB3" : kw("keyword"),
      "LatoocarfianL" : kw("keyword"),
      "Median" : kw("keyword"),
      "Date" : kw("keyword"),
      "GUI" : kw("keyword"),
      "HenonTrig" : kw("keyword"),
      "BufChannels" : kw("keyword"),
      "Cepstrum" : kw("keyword"),
      "HIDUsage" : kw("keyword"),
      "NumChannels" : kw("keyword"),
      "Error" : kw("keyword"),
      "DiodeRingMod" : kw("keyword"),
      "AllpassN" : kw("keyword"),
      "SpruceBudworm" : kw("keyword"),
      "SynthControl" : kw("keyword"),
      "LinRand" : kw("keyword"),
      "QHLayoutView" : kw("keyword"),
      "PVFile" : kw("keyword"),
      "Pkey" : kw("keyword"),
      "FFTMKL" : kw("keyword"),
      "NdefGui" : kw("keyword"),
      "IODesc" : kw("keyword"),
      "BendResponder" : kw("keyword"),
      "AbstractServerAction" : kw("keyword"),
      "GaussClass" : kw("keyword"),
      "QObject" : kw("keyword"),
      "GridLayout" : kw("keyword"),
      "NLFiltN" : kw("keyword"),
      "StereoConvolution2L" : kw("keyword"),
      "Plazy" : kw("keyword"),
      "FFTFlux" : kw("keyword"),
      "PV_Morph" : kw("keyword"),
      "Osc" : kw("keyword"),
      "JITGui" : kw("keyword"),
      "SoundFileView" : kw("keyword"),
      "DC" : kw("keyword"),
      "ProcMod" : kw("keyword"),
      "PanB" : kw("keyword"),
      "Clock" : kw("keyword"),
      "HIDElementDispatcher" : kw("keyword"),
      "Complex" : kw("keyword"),
      "StackLayout" : kw("keyword"),
      "HIDRawValueMatcher" : kw("keyword"),
      "JPverb" : kw("keyword"),
      "TWChoose" : kw("keyword"),
      "FoaPressY" : kw("keyword"),
      "FoaPushZ" : kw("keyword"),
      "PV_BinBufRd" : kw("keyword"),
      "LIDAbsInfo" : kw("keyword"),
      "BufDelayN" : kw("keyword"),
      "QKnob" : kw("keyword"),
      "LPF18" : kw("keyword"),
      "AmpComp" : kw("keyword"),
      "PV_OddBin" : kw("keyword"),
      "T2A" : kw("keyword"),
      "InterPoint" : kw("keyword"),
      "FunctionDefInspector" : kw("keyword"),
      "KeyState" : kw("keyword"),
      "Penvir" : kw("keyword"),
      "WiiRemoteGUI" : kw("keyword"),
      "PV_BinScramble" : kw("keyword"),
      "SinTone" : kw("keyword"),
      "Clipper32" : kw("keyword"),
      "FoaDominateX" : kw("keyword"),
      "Function" : kw("keyword"),
      "Pfset" : kw("keyword"),
      "PV_MaxMagN" : kw("keyword"),
      "Pfsm" : kw("keyword"),
      "Shift90" : kw("keyword"),
      "AbstractMDPlugin" : kw("keyword"),
      "Color" : kw("keyword"),
      "ExpRand" : kw("keyword"),
      "ClassBrowser" : kw("keyword"),
      "PeakEQ4" : kw("keyword"),
      "PV_NoiseSynthP" : kw("keyword"),
      "Archive" : kw("keyword"),
      "Phasor" : kw("keyword"),
      "IOStream" : kw("keyword"),
      "PowerOfTwoAllocator" : kw("keyword"),
      "BufCombC" : kw("keyword"),
      "LFBrownNoise1" : kw("keyword"),
      "PfadeIn" : kw("keyword"),
      "Spec" : kw("keyword"),
      "LineLayout" : kw("keyword"),
      "Oregonator" : kw("keyword"),
      "Switch" : kw("keyword"),
      "MethodError" : kw("keyword"),
      "Vocode" : kw("keyword"),
      "QuartzComposerView" : kw("keyword"),
      "GravityGrid" : kw("keyword"),
      "FoaEncoderKernel" : kw("keyword"),
      "LanguageConfig" : kw("keyword"),
      "Filter" : kw("keyword"),
      "IRand" : kw("keyword"),
      "Pbinop" : kw("keyword"),
      "PV_PhaseShift" : kw("keyword"),
      "Ppatlace" : kw("keyword"),
      "BlitB3Square" : kw("keyword"),
      "Scale" : kw("keyword"),
      "TBetaRand" : kw("keyword"),
      "MultiLevelIdentityDictionary" : kw("keyword"),
      "TDuty" : kw("keyword"),
      "DbufTag" : kw("keyword"),
      "Pflatten" : kw("keyword"),
      "Spawner" : kw("keyword"),
      "SawDPW" : kw("keyword"),
      "VarLag" : kw("keyword"),
      "Pstretchp" : kw("keyword"),
      "InRect" : kw("keyword"),
      "Getenv" : kw("keyword"),
      "PulseDPW" : kw("keyword"),
      "NTube" : kw("keyword"),
      "PV_MagMul" : kw("keyword"),
      "SoftClipper8" : kw("keyword"),
      "BiPanB2" : kw("keyword"),
      "Compander" : kw("keyword"),
      "AtsSynth" : kw("keyword"),
      "GrayNoise" : kw("keyword"),
      "HPZ1" : kw("keyword"),
      "PureUGen" : kw("keyword"),
      "NdefParamGui" : kw("keyword"),
      "Latoocarfian2DL" : kw("keyword"),
      "PointSource" : kw("keyword"),
      "SinOscFB" : kw("keyword"),
      "Dconst" : kw("keyword"),
      "IFFT" : kw("keyword"),
      "LinearWarp" : kw("keyword"),
      "Sieve1" : kw("keyword"),
      "Psync" : kw("keyword"),
      "ObjectTable" : kw("keyword"),
      "AtsFreq" : kw("keyword"),
      "PulseCount" : kw("keyword"),
      "OteySoundBoard" : kw("keyword"),
      "Signal" : kw("keyword"),
      "PdefnGui" : kw("keyword"),
      "NestedAllpassN" : kw("keyword"),
      "WeaklyNonlinear" : kw("keyword"),
      "PartConv" : kw("keyword"),
      "PitchShift" : kw("keyword"),
      "Punop" : kw("keyword"),
      "FBSineC" : kw("keyword"),
      "FoaXformerMatrix" : kw("keyword"),
      "AtsFile" : kw("keyword"),
      "NAryOpFunction" : kw("keyword"),
      "Pfunc" : kw("keyword"),
      "PV_MagBelow" : kw("keyword"),
      "GbmanL" : kw("keyword"),
      "InGrainI" : kw("keyword"),
      "Friction" : kw("keyword"),
      "SinGrain" : kw("keyword"),
      "QOrientation" : kw("keyword"),
      "MoogLadder" : kw("keyword"),
      "MouseY" : kw("keyword"),
      "Blip" : kw("keyword"),
      "MIDIFuncSrcSysMessageMatcher" : kw("keyword"),
      "Wavetable" : kw("keyword"),
      "MIDIMessageDispatcher" : kw("keyword"),
      "Bus" : kw("keyword"),
      "AudioControl" : kw("keyword"),
      "GaussTrig" : kw("keyword"),
      "CleanupStream" : kw("keyword"),
      "GlitchBRF" : kw("keyword"),
      "QPopUpMenu" : kw("keyword"),
      "LinExp" : kw("keyword"),
      "Line" : kw("keyword"),
      "BFEncode" : kw("keyword"),
      "Pstep2add" : kw("keyword"),
      "LagControl" : kw("keyword"),
      "ArrayMin" : kw("keyword"),
      "PV_MagMap" : kw("keyword"),
      "Standard2DC" : kw("keyword"),
      "HIDInfo" : kw("keyword"),
      "MIDIMTCtoSMPTEDispatcher" : kw("keyword"),
      "AbstractOpPlug" : kw("keyword"),
      "Amplitude" : kw("keyword"),
      "TreeView" : kw("keyword"),
      "QButton" : kw("keyword"),
      "Changed" : kw("keyword"),
      "FoaPress" : kw("keyword"),
      "PV_PhaseShift270" : kw("keyword")

    };

    // Extend the 'normal' keywords with the TypeScript language extensions
    if (isTS) {
      var type = {type: "variable", style: "type"};
      var tsKeywords = {
        // object-like things
        "interface": kw("class"),
        "implements": C,
        "namespace": C,
        "module": kw("module"),
        "enum": kw("module"),

        // scope modifiers
        "public": kw("modifier"),
        "private": kw("modifier"),
        "protected": kw("modifier"),
        "abstract": kw("modifier"),

        // types
        "string": type, "number": type, "boolean": type, "any": type
      };

      for (var attr in tsKeywords) {
        jsKeywords[attr] = tsKeywords[attr];
      }
    }

    return jsKeywords;
  }();

  var isOperatorChar = /[+\-*&%=<>!?|~^@]/;
  var isJsonldKeyword = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;

  function readRegexp(stream) {
    var escaped = false, next, inSet = false;
    while ((next = stream.next()) != null) {
      if (!escaped) {
        if (next == "/" && !inSet) return;
        if (next == "[") inSet = true;
        else if (inSet && next == "]") inSet = false;
      }
      escaped = !escaped && next == "\\";
    }
  }

  // Used as scratch variables to communicate multiple values without
  // consing up tons of objects.
  var type, content;
  function ret(tp, style, cont) {
    type = tp; content = cont;
    return style;
  }
  function tokenBase(stream, state) {
    var ch = stream.next();
    if (ch == '"' || ch == "'") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    } else if (ch == "." && stream.match(/^\d+(?:[eE][+\-]?\d+)?/)) {
      return ret("number", "number");
    } else if (ch == "." && stream.match("..")) {
      return ret("spread", "meta");
    } else if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
      return ret(ch);
    } else if (ch == "=" && stream.eat(">")) {
      return ret("=>", "operator");
    } else if (ch == "0" && stream.eat(/x/i)) {
      stream.eatWhile(/[\da-f]/i);
      return ret("number", "number");
    } else if (ch == "0" && stream.eat(/o/i)) {
      stream.eatWhile(/[0-7]/i);
      return ret("number", "number");
    } else if (ch == "0" && stream.eat(/b/i)) {
      stream.eatWhile(/[01]/i);
      return ret("number", "number");
    } else if (/\d/.test(ch)) {
      stream.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/);
      return ret("number", "number");
    } else if (ch == "/") {
      if (stream.eat("*")) {
        state.tokenize = tokenComment;
        return tokenComment(stream, state);
      } else if (stream.eat("/")) {
        stream.skipToEnd();
        return ret("comment", "comment");
      } else if (expressionAllowed(stream, state, 1)) {
        readRegexp(stream);
        stream.match(/^\b(([gimyu])(?![gimyu]*\2))+\b/);
        return ret("regexp", "string-2");
      } else {
        stream.eatWhile(isOperatorChar);
        return ret("operator", "operator", stream.current());
      }
    } else if (ch == "`") {
      state.tokenize = tokenQuasi;
      return tokenQuasi(stream, state);
    } else if (ch == "#") {
      stream.skipToEnd();
      return ret("error", "error");
    } else if (isOperatorChar.test(ch)) {
      if (ch != ">" || !state.lexical || state.lexical.type != ">")
        stream.eatWhile(isOperatorChar);
      return ret("operator", "operator", stream.current());
    } else if (wordRE.test(ch)) {
      stream.eatWhile(wordRE);
      var word = stream.current()
      if (state.lastType != ".") {
        if (keywords.propertyIsEnumerable(word)) {
          var kw = keywords[word]
          return ret(kw.type, kw.style, word)
        }
        if (word == "async" && stream.match(/^\s*[\(\w]/, false))
          return ret("async", "keyword", word)
      }
      return ret("variable", "variable", word)
    }
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next;
      if (jsonldMode && stream.peek() == "@" && stream.match(isJsonldKeyword)){
        state.tokenize = tokenBase;
        return ret("jsonld-keyword", "meta");
      }
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) break;
        escaped = !escaped && next == "\\";
      }
      if (!escaped) state.tokenize = tokenBase;
      return ret("string", "string");
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ret("comment", "comment");
  }

  function tokenQuasi(stream, state) {
    var escaped = false, next;
    while ((next = stream.next()) != null) {
      if (!escaped && (next == "`" || next == "$" && stream.eat("{"))) {
        state.tokenize = tokenBase;
        break;
      }
      escaped = !escaped && next == "\\";
    }
    return ret("quasi", "string-2", stream.current());
  }

  var brackets = "([{}])";
  // This is a crude lookahead trick to try and notice that we're
  // parsing the argument patterns for a fat-arrow function before we
  // actually hit the arrow token. It only works if the arrow is on
  // the same line as the arguments and there's no strange noise
  // (comments) in between. Fallback is to only notice when we hit the
  // arrow, and not declare the arguments as locals for the arrow
  // body.
  function findFatArrow(stream, state) {
    if (state.fatArrowAt) state.fatArrowAt = null;
    var arrow = stream.string.indexOf("=>", stream.start);
    if (arrow < 0) return;

    if (isTS) { // Try to skip TypeScript return type declarations after the arguments
      var m = /:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(stream.string.slice(stream.start, arrow))
      if (m) arrow = m.index
    }

    var depth = 0, sawSomething = false;
    for (var pos = arrow - 1; pos >= 0; --pos) {
      var ch = stream.string.charAt(pos);
      var bracket = brackets.indexOf(ch);
      if (bracket >= 0 && bracket < 3) {
        if (!depth) { ++pos; break; }
        if (--depth == 0) { if (ch == "(") sawSomething = true; break; }
      } else if (bracket >= 3 && bracket < 6) {
        ++depth;
      } else if (wordRE.test(ch)) {
        sawSomething = true;
      } else if (/["'\/]/.test(ch)) {
        return;
      } else if (sawSomething && !depth) {
        ++pos;
        break;
      }
    }
    if (sawSomething && !depth) state.fatArrowAt = pos;
  }

  // Parser

  var atomicTypes = {"atom": true, "number": true, "variable": true, "string": true, "regexp": true, "this": true, "jsonld-keyword": true};

  function JSLexical(indented, column, type, align, prev, info) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.prev = prev;
    this.info = info;
    if (align != null) this.align = align;
  }

  function inScope(state, varname) {
    for (var v = state.localVars; v; v = v.next)
      if (v.name == varname) return true;
    for (var cx = state.context; cx; cx = cx.prev) {
      for (var v = cx.vars; v; v = v.next)
        if (v.name == varname) return true;
    }
  }

  function parseJS(state, style, type, content, stream) {
    var cc = state.cc;
    // Communicate our context to the combinators.
    // (Less wasteful than consing up a hundred closures on every call.)
    cx.state = state; cx.stream = stream; cx.marked = null, cx.cc = cc; cx.style = style;

    if (!state.lexical.hasOwnProperty("align"))
      state.lexical.align = true;

    while(true) {
      var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
      if (combinator(type, content)) {
        while(cc.length && cc[cc.length - 1].lex)
          cc.pop()();
        if (cx.marked) return cx.marked;
        if (type == "variable" && inScope(state, content)) return "variable-2";
        return style;
      }
    }
  }

  // Combinator utils

  var cx = {state: null, column: null, marked: null, cc: null};
  function pass() {
    for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
  }
  function cont() {
    pass.apply(null, arguments);
    return true;
  }
  function register(varname) {
    function inList(list) {
      for (var v = list; v; v = v.next)
        if (v.name == varname) return true;
      return false;
    }
    var state = cx.state;
    cx.marked = "def";
    if (state.context) {
      if (inList(state.localVars)) return;
      state.localVars = {name: varname, next: state.localVars};
    } else {
      if (inList(state.globalVars)) return;
      if (parserConfig.globalVars)
        state.globalVars = {name: varname, next: state.globalVars};
    }
  }

  // Combinators

  var defaultVars = {name: "this", next: {name: "arguments"}};
  function pushcontext() {
    cx.state.context = {prev: cx.state.context, vars: cx.state.localVars};
    cx.state.localVars = defaultVars;
  }
  function popcontext() {
    cx.state.localVars = cx.state.context.vars;
    cx.state.context = cx.state.context.prev;
  }
  function pushlex(type, info) {
    var result = function() {
      var state = cx.state, indent = state.indented;
      if (state.lexical.type == "stat") indent = state.lexical.indented;
      else for (var outer = state.lexical; outer && outer.type == ")" && outer.align; outer = outer.prev)
        indent = outer.indented;
      state.lexical = new JSLexical(indent, cx.stream.column(), type, null, state.lexical, info);
    };
    result.lex = true;
    return result;
  }
  function poplex() {
    var state = cx.state;
    if (state.lexical.prev) {
      if (state.lexical.type == ")")
        state.indented = state.lexical.indented;
      state.lexical = state.lexical.prev;
    }
  }
  poplex.lex = true;

  function expect(wanted) {
    function exp(type) {
      if (type == wanted) return cont();
      else if (wanted == ";") return pass();
      else return cont(exp);
    };
    return exp;
  }

  function statement(type, value) {
    if (type == "var") return cont(pushlex("vardef", value.length), vardef, expect(";"), poplex);
    if (type == "keyword a") return cont(pushlex("form"), parenExpr, statement, poplex);
    if (type == "keyword b") return cont(pushlex("form"), statement, poplex);
    if (type == "{") return cont(pushlex("}"), block, poplex);
    if (type == ";") return cont();
    if (type == "if") {
      if (cx.state.lexical.info == "else" && cx.state.cc[cx.state.cc.length - 1] == poplex)
        cx.state.cc.pop()();
      return cont(pushlex("form"), parenExpr, statement, poplex, maybeelse);
    }
    if (type == "function") return cont(functiondef);
    if (type == "for") return cont(pushlex("form"), forspec, statement, poplex);
    if (type == "variable") {
      if (isTS && value == "type") {
        cx.marked = "keyword"
        return cont(typeexpr, expect("operator"), typeexpr, expect(";"));
      } else {
        return cont(pushlex("stat"), maybelabel);
      }
    }
    if (type == "switch") return cont(pushlex("form"), parenExpr, expect("{"), pushlex("}", "switch"),
                                      block, poplex, poplex);
    if (type == "case") return cont(expression, expect(":"));
    if (type == "default") return cont(expect(":"));
    if (type == "catch") return cont(pushlex("form"), pushcontext, expect("("), funarg, expect(")"),
                                     statement, poplex, popcontext);
    if (type == "class") return cont(pushlex("form"), className, poplex);
    if (type == "export") return cont(pushlex("stat"), afterExport, poplex);
    if (type == "import") return cont(pushlex("stat"), afterImport, poplex);
    if (type == "module") return cont(pushlex("form"), pattern, expect("{"), pushlex("}"), block, poplex, poplex)
    if (type == "async") return cont(statement)
    if (value == "@") return cont(expression, statement)
    return pass(pushlex("stat"), expression, expect(";"), poplex);
  }
  function expression(type) {
    return expressionInner(type, false);
  }
  function expressionNoComma(type) {
    return expressionInner(type, true);
  }
  function parenExpr(type) {
    if (type != "(") return pass()
    return cont(pushlex(")"), expression, expect(")"), poplex)
  }
  function expressionInner(type, noComma) {
    if (cx.state.fatArrowAt == cx.stream.start) {
      var body = noComma ? arrowBodyNoComma : arrowBody;
      if (type == "(") return cont(pushcontext, pushlex(")"), commasep(pattern, ")"), poplex, expect("=>"), body, popcontext);
      else if (type == "variable") return pass(pushcontext, pattern, expect("=>"), body, popcontext);
    }

    var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
    if (atomicTypes.hasOwnProperty(type)) return cont(maybeop);
    if (type == "function") return cont(functiondef, maybeop);
    if (type == "class") return cont(pushlex("form"), classExpression, poplex);
    if (type == "keyword c" || type == "async") return cont(noComma ? maybeexpressionNoComma : maybeexpression);
    if (type == "(") return cont(pushlex(")"), maybeexpression, expect(")"), poplex, maybeop);
    if (type == "operator" || type == "spread") return cont(noComma ? expressionNoComma : expression);
    if (type == "[") return cont(pushlex("]"), arrayLiteral, poplex, maybeop);
    if (type == "{") return contCommasep(objprop, "}", null, maybeop);
    if (type == "quasi") return pass(quasi, maybeop);
    if (type == "new") return cont(maybeTarget(noComma));
    return cont();
  }
  function maybeexpression(type) {
    if (type.match(/[;\}\)\],]/)) return pass();
    return pass(expression);
  }
  function maybeexpressionNoComma(type) {
    if (type.match(/[;\}\)\],]/)) return pass();
    return pass(expressionNoComma);
  }

  function maybeoperatorComma(type, value) {
    if (type == ",") return cont(expression);
    return maybeoperatorNoComma(type, value, false);
  }
  function maybeoperatorNoComma(type, value, noComma) {
    var me = noComma == false ? maybeoperatorComma : maybeoperatorNoComma;
    var expr = noComma == false ? expression : expressionNoComma;
    if (type == "=>") return cont(pushcontext, noComma ? arrowBodyNoComma : arrowBody, popcontext);
    if (type == "operator") {
      if (/\+\+|--/.test(value)) return cont(me);
      if (value == "?") return cont(expression, expect(":"), expr);
      return cont(expr);
    }
    if (type == "quasi") { return pass(quasi, me); }
    if (type == ";") return;
    if (type == "(") return contCommasep(expressionNoComma, ")", "call", me);
    if (type == ".") return cont(property, me);
    if (type == "[") return cont(pushlex("]"), maybeexpression, expect("]"), poplex, me);
    if (isTS && value == "as") { cx.marked = "keyword"; return cont(typeexpr, me) }
  }
  function quasi(type, value) {
    if (type != "quasi") return pass();
    if (value.slice(value.length - 2) != "${") return cont(quasi);
    return cont(expression, continueQuasi);
  }
  function continueQuasi(type) {
    if (type == "}") {
      cx.marked = "string-2";
      cx.state.tokenize = tokenQuasi;
      return cont(quasi);
    }
  }
  function arrowBody(type) {
    findFatArrow(cx.stream, cx.state);
    return pass(type == "{" ? statement : expression);
  }
  function arrowBodyNoComma(type) {
    findFatArrow(cx.stream, cx.state);
    return pass(type == "{" ? statement : expressionNoComma);
  }
  function maybeTarget(noComma) {
    return function(type) {
      if (type == ".") return cont(noComma ? targetNoComma : target);
      else return pass(noComma ? expressionNoComma : expression);
    };
  }
  function target(_, value) {
    if (value == "target") { cx.marked = "keyword"; return cont(maybeoperatorComma); }
  }
  function targetNoComma(_, value) {
    if (value == "target") { cx.marked = "keyword"; return cont(maybeoperatorNoComma); }
  }
  function maybelabel(type) {
    if (type == ":") return cont(poplex, statement);
    return pass(maybeoperatorComma, expect(";"), poplex);
  }
  function property(type) {
    if (type == "variable") {cx.marked = "property"; return cont();}
  }
  function objprop(type, value) {
    if (type == "async") {
      cx.marked = "property";
      return cont(objprop);
    } else if (type == "variable" || cx.style == "keyword") {
      cx.marked = "property";
      if (value == "get" || value == "set") return cont(getterSetter);
      return cont(afterprop);
    } else if (type == "number" || type == "string") {
      cx.marked = jsonldMode ? "property" : (cx.style + " property");
      return cont(afterprop);
    } else if (type == "jsonld-keyword") {
      return cont(afterprop);
    } else if (type == "modifier") {
      return cont(objprop)
    } else if (type == "[") {
      return cont(expression, expect("]"), afterprop);
    } else if (type == "spread") {
      return cont(expression, afterprop);
    } else if (type == ":") {
      return pass(afterprop)
    }
  }
  function getterSetter(type) {
    if (type != "variable") return pass(afterprop);
    cx.marked = "property";
    return cont(functiondef);
  }
  function afterprop(type) {
    if (type == ":") return cont(expressionNoComma);
    if (type == "(") return pass(functiondef);
  }
  function commasep(what, end, sep) {
    function proceed(type, value) {
      if (sep ? sep.indexOf(type) > -1 : type == ",") {
        var lex = cx.state.lexical;
        if (lex.info == "call") lex.pos = (lex.pos || 0) + 1;
        return cont(function(type, value) {
          if (type == end || value == end) return pass()
          return pass(what)
        }, proceed);
      }
      if (type == end || value == end) return cont();
      return cont(expect(end));
    }
    return function(type, value) {
      if (type == end || value == end) return cont();
      return pass(what, proceed);
    };
  }
  function contCommasep(what, end, info) {
    for (var i = 3; i < arguments.length; i++)
      cx.cc.push(arguments[i]);
    return cont(pushlex(end, info), commasep(what, end), poplex);
  }
  function block(type) {
    if (type == "}") return cont();
    return pass(statement, block);
  }
  function maybetype(type, value) {
    if (isTS) {
      if (type == ":") return cont(typeexpr);
      if (value == "?") return cont(maybetype);
    }
  }
  function typeexpr(type) {
    if (type == "variable") {cx.marked = "type"; return cont(afterType);}
    if (type == "string" || type == "number" || type == "atom") return cont(afterType);
    if (type == "{") return cont(pushlex("}"), commasep(typeprop, "}", ",;"), poplex, afterType)
    if (type == "(") return cont(commasep(typearg, ")"), maybeReturnType)
  }
  function maybeReturnType(type) {
    if (type == "=>") return cont(typeexpr)
  }
  function typeprop(type, value) {
    if (type == "variable" || cx.style == "keyword") {
      cx.marked = "property"
      return cont(typeprop)
    } else if (value == "?") {
      return cont(typeprop)
    } else if (type == ":") {
      return cont(typeexpr)
    } else if (type == "[") {
      return cont(expression, maybetype, expect("]"), typeprop)
    }
  }
  function typearg(type) {
    if (type == "variable") return cont(typearg)
    else if (type == ":") return cont(typeexpr)
  }
  function afterType(type, value) {
    if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType)
    if (value == "|" || type == ".") return cont(typeexpr)
    if (type == "[") return cont(expect("]"), afterType)
    if (value == "extends") return cont(typeexpr)
  }
  function vardef() {
    return pass(pattern, maybetype, maybeAssign, vardefCont);
  }
  function pattern(type, value) {
    if (type == "modifier") return cont(pattern)
    if (type == "variable") { register(value); return cont(); }
    if (type == "spread") return cont(pattern);
    if (type == "[") return contCommasep(pattern, "]");
    if (type == "{") return contCommasep(proppattern, "}");
  }
  function proppattern(type, value) {
    if (type == "variable" && !cx.stream.match(/^\s*:/, false)) {
      register(value);
      return cont(maybeAssign);
    }
    if (type == "variable") cx.marked = "property";
    if (type == "spread") return cont(pattern);
    if (type == "}") return pass();
    return cont(expect(":"), pattern, maybeAssign);
  }
  function maybeAssign(_type, value) {
    if (value == "=") return cont(expressionNoComma);
  }
  function vardefCont(type) {
    if (type == ",") return cont(vardef);
  }
  function maybeelse(type, value) {
    if (type == "keyword b" && value == "else") return cont(pushlex("form", "else"), statement, poplex);
  }
  function forspec(type) {
    if (type == "(") return cont(pushlex(")"), forspec1, expect(")"), poplex);
  }
  function forspec1(type) {
    if (type == "var") return cont(vardef, expect(";"), forspec2);
    if (type == ";") return cont(forspec2);
    if (type == "variable") return cont(formaybeinof);
    return pass(expression, expect(";"), forspec2);
  }
  function formaybeinof(_type, value) {
    if (value == "in" || value == "of") { cx.marked = "keyword"; return cont(expression); }
    return cont(maybeoperatorComma, forspec2);
  }
  function forspec2(type, value) {
    if (type == ";") return cont(forspec3);
    if (value == "in" || value == "of") { cx.marked = "keyword"; return cont(expression); }
    return pass(expression, expect(";"), forspec3);
  }
  function forspec3(type) {
    if (type != ")") cont(expression);
  }
  function functiondef(type, value) {
    if (value == "*") {cx.marked = "keyword"; return cont(functiondef);}
    if (type == "variable") {register(value); return cont(functiondef);}
    if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, maybetype, statement, popcontext);
    if (isTS && value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, functiondef)
  }
  function funarg(type) {
    if (type == "spread") return cont(funarg);
    return pass(pattern, maybetype, maybeAssign);
  }
  function classExpression(type, value) {
    // Class expressions may have an optional name.
    if (type == "variable") return className(type, value);
    return classNameAfter(type, value);
  }
  function className(type, value) {
    if (type == "variable") {register(value); return cont(classNameAfter);}
  }
  function classNameAfter(type, value) {
    if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, classNameAfter)
    if (value == "extends" || value == "implements" || (isTS && type == ","))
      return cont(isTS ? typeexpr : expression, classNameAfter);
    if (type == "{") return cont(pushlex("}"), classBody, poplex);
  }
  function classBody(type, value) {
    if (type == "variable" || cx.style == "keyword") {
      if ((value == "async" || value == "static" || value == "get" || value == "set" ||
           (isTS && (value == "public" || value == "private" || value == "protected" || value == "readonly" || value == "abstract"))) &&
          cx.stream.match(/^\s+[\w$\xa1-\uffff]/, false)) {
        cx.marked = "keyword";
        return cont(classBody);
      }
      cx.marked = "property";
      return cont(isTS ? classfield : functiondef, classBody);
    }
    if (type == "[")
      return cont(expression, expect("]"), isTS ? classfield : functiondef, classBody)
    if (value == "*") {
      cx.marked = "keyword";
      return cont(classBody);
    }
    if (type == ";") return cont(classBody);
    if (type == "}") return cont();
    if (value == "@") return cont(expression, classBody)
  }
  function classfield(type, value) {
    if (value == "?") return cont(classfield)
    if (type == ":") return cont(typeexpr, maybeAssign)
    if (value == "=") return cont(expressionNoComma)
    return pass(functiondef)
  }
  function afterExport(type, value) {
    if (value == "*") { cx.marked = "keyword"; return cont(maybeFrom, expect(";")); }
    if (value == "default") { cx.marked = "keyword"; return cont(expression, expect(";")); }
    if (type == "{") return cont(commasep(exportField, "}"), maybeFrom, expect(";"));
    return pass(statement);
  }
  function exportField(type, value) {
    if (value == "as") { cx.marked = "keyword"; return cont(expect("variable")); }
    if (type == "variable") return pass(expressionNoComma, exportField);
  }
  function afterImport(type) {
    if (type == "string") return cont();
    return pass(importSpec, maybeMoreImports, maybeFrom);
  }
  function importSpec(type, value) {
    if (type == "{") return contCommasep(importSpec, "}");
    if (type == "variable") register(value);
    if (value == "*") cx.marked = "keyword";
    return cont(maybeAs);
  }
  function maybeMoreImports(type) {
    if (type == ",") return cont(importSpec, maybeMoreImports)
  }
  function maybeAs(_type, value) {
    if (value == "as") { cx.marked = "keyword"; return cont(importSpec); }
  }
  function maybeFrom(_type, value) {
    if (value == "from") { cx.marked = "keyword"; return cont(expression); }
  }
  function arrayLiteral(type) {
    if (type == "]") return cont();
    return pass(commasep(expressionNoComma, "]"));
  }

  function isContinuedStatement(state, textAfter) {
    return state.lastType == "operator" || state.lastType == "," ||
      isOperatorChar.test(textAfter.charAt(0)) ||
      /[,.]/.test(textAfter.charAt(0));
  }

  // Interface

  return {
    startState: function(basecolumn) {
      var state = {
        tokenize: tokenBase,
        lastType: "sof",
        cc: [],
        lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
        localVars: parserConfig.localVars,
        context: parserConfig.localVars && {vars: parserConfig.localVars},
        indented: basecolumn || 0
      };
      if (parserConfig.globalVars && typeof parserConfig.globalVars == "object")
        state.globalVars = parserConfig.globalVars;
      return state;
    },

    token: function(stream, state) {
      if (stream.sol()) {
        if (!state.lexical.hasOwnProperty("align"))
          state.lexical.align = false;
        state.indented = stream.indentation();
        findFatArrow(stream, state);
      }
      if (state.tokenize != tokenComment && stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);
      if (type == "comment") return style;
      state.lastType = type == "operator" && (content == "++" || content == "--") ? "incdec" : type;
      return parseJS(state, style, type, content, stream);
    },

    indent: function(state, textAfter) {
      if (state.tokenize == tokenComment) return CodeMirror.Pass;
      if (state.tokenize != tokenBase) return 0;
      var firstChar = textAfter && textAfter.charAt(0), lexical = state.lexical, top
      // Kludge to prevent 'maybelse' from blocking lexical scope pops
      if (!/^\s*else\b/.test(textAfter)) for (var i = state.cc.length - 1; i >= 0; --i) {
        var c = state.cc[i];
        if (c == poplex) lexical = lexical.prev;
        else if (c != maybeelse) break;
      }
      while ((lexical.type == "stat" || lexical.type == "form") &&
             (firstChar == "}" || ((top = state.cc[state.cc.length - 1]) &&
                                   (top == maybeoperatorComma || top == maybeoperatorNoComma) &&
                                   !/^[,\.=+\-*:?[\(]/.test(textAfter))))
        lexical = lexical.prev;
      if (statementIndent && lexical.type == ")" && lexical.prev.type == "stat")
        lexical = lexical.prev;
      var type = lexical.type, closing = firstChar == type;

      if (type == "vardef") return lexical.indented + (state.lastType == "operator" || state.lastType == "," ? lexical.info + 1 : 0);
      else if (type == "form" && firstChar == "{") return lexical.indented;
      else if (type == "form") return lexical.indented + indentUnit;
      else if (type == "stat")
        return lexical.indented + (isContinuedStatement(state, textAfter) ? statementIndent || indentUnit : 0);
      else if (lexical.info == "switch" && !closing && parserConfig.doubleIndentSwitch != false)
        return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);
      else if (lexical.align) return lexical.column + (closing ? 0 : 1);
      else return lexical.indented + (closing ? 0 : indentUnit);
    },

    electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
    blockCommentStart: jsonMode ? null : "/*",
    blockCommentEnd: jsonMode ? null : "*/",
    lineComment: jsonMode ? null : "//",
    fold: "brace",
    closeBrackets: "()[]{}''\"\"``",

    helperType: jsonMode ? "json" : "sc",
    jsonldMode: jsonldMode,
    jsonMode: jsonMode,

    expressionAllowed: expressionAllowed,
    skipExpression: function(state) {
      var top = state.cc[state.cc.length - 1]
      if (top == expression || top == expressionNoComma) state.cc.pop()
    }
  };
});

CodeMirror.registerHelper("wordChars", "sc", /[\w$]/);

CodeMirror.defineMIME("text/sc", "sc");
CodeMirror.defineMIME("text/ecmascript", "sc");
CodeMirror.defineMIME("application/sc", "sc");
CodeMirror.defineMIME("application/x-sc", "sc");
CodeMirror.defineMIME("application/ecmascript", "sc");
CodeMirror.defineMIME("application/json", {name: "sc", json: true});
CodeMirror.defineMIME("application/x-json", {name: "sc", json: true});
CodeMirror.defineMIME("application/ld+json", {name: "sc", jsonld: true});
CodeMirror.defineMIME("text/typescript", { name: "sc", typescript: true });
CodeMirror.defineMIME("application/typescript", { name: "sc", typescript: true });

});
